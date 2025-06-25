-- Insert services
INSERT INTO public.services (name, description, base_price) VALUES
('Personal Care', 'Assistance with bathing, dressing, grooming', 35.00),
('Companionship', 'Social interaction, conversation, activities', 25.00),
('Medication Management', 'Medication reminders and organization', 30.00),
('Running Errands', 'Grocery shopping, prescription pickup', 28.00),
('Household Chores', 'Light cleaning, laundry, meal preparation', 32.00);

-- Insert certifications
INSERT INTO public.certifications (name, description) VALUES
('CPR Certification', 'Cardiopulmonary Resuscitation certification'),
('First Aid Certification', 'Basic first aid training'),
('CNA', 'Certified Nursing Assistant'),
('HHA', 'Home Health Aide certification'),
('Alzheimer''s Care Training', 'Specialized training for dementia care'),
('Medication Administration', 'Training for medication management');

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply triggers
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_client_profiles_updated_at BEFORE UPDATE ON public.client_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_caregiver_profiles_updated_at BEFORE UPDATE ON public.caregiver_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_bookings_updated_at BEFORE UPDATE ON public.bookings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
