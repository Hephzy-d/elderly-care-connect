pipeline {
    agent any

    stages {
        stage('Checkout') {
            steps {
                git url: 'https://github.com/Hephzy-d/elderly-care-connect.git'
            }
        }

        stage('Install Dependencies') {
            steps {
                sh 'npm install --legacy-peer-deps'
            }
        }

        stage('Build') {
            steps {
                sh 'npm build'
            }
        }

        stage('Test') {
            steps {
                sh 'npm test' // if you don’t have tests, remove this stage
            }
        }
    }
}
