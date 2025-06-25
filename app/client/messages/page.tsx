"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Heart, ArrowLeft, Send, Search, Phone, Video } from "lucide-react"
import { getCurrentUser } from "@/lib/auth"
import { supabase } from "@/lib/supabase"

export default function MessagesPage() {
  const [user, setUser] = useState<any>(null)
  const [conversations, setConversations] = useState<any[]>([])
  const [selectedConversation, setSelectedConversation] = useState<any>(null)
  const [messages, setMessages] = useState<any[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [loading, setLoading] = useState(true)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    async function loadData() {
      try {
        const currentUser = await getCurrentUser()
        setUser(currentUser)
        await loadConversations(currentUser?.id)
      } catch (error) {
        console.error("Error loading messages:", error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  const loadConversations = async (userId: string) => {
    const { data, error } = await supabase
      .from("messages")
      .select(`
        *,
        sender:sender_id(first_name, last_name, avatar_url),
        recipient:recipient_id(first_name, last_name, avatar_url)
      `)
      .or(`sender_id.eq.${userId},recipient_id.eq.${userId}`)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error loading conversations:", error)
      return
    }

    // Group messages by conversation
    const conversationMap = new Map()
    data?.forEach((message) => {
      const otherUser = message.sender_id === userId ? message.recipient : message.sender
      const conversationKey = message.sender_id === userId ? message.recipient_id : message.sender_id

      if (!conversationMap.has(conversationKey)) {
        conversationMap.set(conversationKey, {
          id: conversationKey,
          user: otherUser,
          lastMessage: message,
          unreadCount: 0,
        })
      }
    })

    setConversations(Array.from(conversationMap.values()))
  }

  const loadMessages = async (conversationId: string) => {
    const { data, error } = await supabase
      .from("messages")
      .select(`
        *,
        sender:sender_id(first_name, last_name, avatar_url)
      `)
      .or(
        `and(sender_id.eq.${user?.id},recipient_id.eq.${conversationId}),and(sender_id.eq.${conversationId},recipient_id.eq.${user?.id})`,
      )
      .order("created_at", { ascending: true })

    if (error) {
      console.error("Error loading messages:", error)
      return
    }

    setMessages(data || [])
  }

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation || !user) return

    const { error } = await supabase.from("messages").insert({
      sender_id: user.id,
      recipient_id: selectedConversation.id,
      content: newMessage.trim(),
    })

    if (error) {
      console.error("Error sending message:", error)
      return
    }

    setNewMessage("")
    await loadMessages(selectedConversation.id)
  }

  useEffect(() => {
    if (selectedConversation) {
      loadMessages(selectedConversation.id)
    }
  }, [selectedConversation, user])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading messages...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href="/client/dashboard">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <Link href="/" className="flex items-center space-x-2">
              <Heart className="h-8 w-8 text-blue-600" />
              <span className="text-2xl font-bold text-gray-900">Elderly Care Connect</span>
            </Link>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Messages</h1>
          <p className="text-gray-600">Communicate with your caregivers</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8 h-[600px]">
          {/* Conversations List */}
          <div className="lg:col-span-1">
            <Card className="h-full">
              <CardHeader>
                <CardTitle>Conversations</CardTitle>
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input placeholder="Search conversations..." className="pl-10" />
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="space-y-1">
                  {conversations.map((conversation) => (
                    <div
                      key={conversation.id}
                      className={`p-4 cursor-pointer hover:bg-gray-50 border-b ${
                        selectedConversation?.id === conversation.id ? "bg-blue-50 border-blue-200" : ""
                      }`}
                      onClick={() => setSelectedConversation(conversation)}
                    >
                      <div className="flex items-center space-x-3">
                        <Avatar>
                          <AvatarImage src={conversation.user?.avatar_url || "/placeholder.svg"} />
                          <AvatarFallback>
                            {`${conversation.user?.first_name?.[0] || ""}${conversation.user?.last_name?.[0] || ""}`}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-medium truncate">
                              {conversation.user?.first_name} {conversation.user?.last_name}
                            </p>
                            <p className="text-xs text-gray-500">
                              {new Date(conversation.lastMessage.created_at).toLocaleDateString()}
                            </p>
                          </div>
                          <p className="text-sm text-gray-600 truncate">{conversation.lastMessage.content}</p>
                        </div>
                        {conversation.unreadCount > 0 && (
                          <Badge className="bg-blue-600">{conversation.unreadCount}</Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Chat Area */}
          <div className="lg:col-span-2">
            <Card className="h-full flex flex-col">
              {selectedConversation ? (
                <>
                  {/* Chat Header */}
                  <CardHeader className="border-b">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <Avatar>
                          <AvatarImage src={selectedConversation.user?.avatar_url || "/placeholder.svg"} />
                          <AvatarFallback>
                            {`${selectedConversation.user?.first_name?.[0] || ""}${selectedConversation.user?.last_name?.[0] || ""}`}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <h3 className="font-semibold">
                            {selectedConversation.user?.first_name} {selectedConversation.user?.last_name}
                          </h3>
                          <p className="text-sm text-gray-600">Caregiver</p>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm">
                          <Phone className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm">
                          <Video className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>

                  {/* Messages */}
                  <CardContent className="flex-1 overflow-y-auto p-4">
                    <div className="space-y-4">
                      {messages.map((message) => (
                        <div
                          key={message.id}
                          className={`flex ${message.sender_id === user?.id ? "justify-end" : "justify-start"}`}
                        >
                          <div
                            className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                              message.sender_id === user?.id ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-900"
                            }`}
                          >
                            <p className="text-sm">{message.content}</p>
                            <p
                              className={`text-xs mt-1 ${
                                message.sender_id === user?.id ? "text-blue-100" : "text-gray-500"
                              }`}
                            >
                              {new Date(message.created_at).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </p>
                          </div>
                        </div>
                      ))}
                      <div ref={messagesEndRef} />
                    </div>
                  </CardContent>

                  {/* Message Input */}
                  <div className="border-t p-4">
                    <div className="flex space-x-2">
                      <Input
                        placeholder="Type a message..."
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyPress={(e) => e.key === "Enter" && sendMessage()}
                        className="flex-1"
                      />
                      <Button onClick={sendMessage} disabled={!newMessage.trim()}>
                        <Send className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </>
              ) : (
                <CardContent className="flex-1 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-gray-400 mb-4">
                      <Search className="h-12 w-12 mx-auto" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Select a conversation</h3>
                    <p className="text-gray-600">Choose a conversation from the list to start messaging.</p>
                  </div>
                </CardContent>
              )}
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
