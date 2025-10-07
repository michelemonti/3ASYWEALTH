# Database Setup Guide - For Template Users

**Quick database setup for new users of the 3ASYAPP template**

## 🚀 Quick Start (5 minutes)

### Step 1: Create Supabase Project
1. Go to [supabase.com](https://supabase.com)
2. Click "New Project" 
3. Choose organization and project name
4. Wait for project creation (2-3 minutes)

### Step 2: Configure Environment
Copy your project credentials:
```bash
# Copy from .env.example to .env.local
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### Step 3: Run Database Migration
Execute the SQL scripts in your Supabase dashboard:

**Go to:** Supabase Dashboard → SQL Editor → New Query

**Copy and execute this SQL:**

```sql
-- =============================================
-- 3ASYAPP TEMPLATE - DATABASE SETUP
-- Execute this script in your Supabase SQL Editor
-- =============================================

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create profiles table (extends auth.users)
CREATE TABLE profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    avatar_url TEXT,
    company TEXT,
    role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin', 'manager')),
    subscription_tier TEXT DEFAULT 'free' CHECK (subscription_tier IN ('free', 'professional', 'enterprise')),
    preferences JSONB DEFAULT '{}',
    last_login TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create business_entities table (your main business data)
CREATE TABLE business_entities (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    category TEXT NOT NULL DEFAULT 'general',
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'pending')),
    metadata JSONB DEFAULT '{}',
    owner_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create activities table (audit log)
CREATE TABLE activities (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    entity_id UUID REFERENCES business_entities(id) ON DELETE CASCADE,
    action TEXT NOT NULL,
    details JSONB DEFAULT '{}',
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create subscriptions table (billing)
CREATE TABLE subscriptions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    stripe_customer_id TEXT,
    stripe_subscription_id TEXT UNIQUE,
    status TEXT NOT NULL CHECK (status IN ('active', 'canceled', 'past_due', 'incomplete', 'trialing')),
    plan_id TEXT NOT NULL,
    current_period_start TIMESTAMP WITH TIME ZONE,
    current_period_end TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- INDEXES FOR PERFORMANCE
-- =============================================

-- Profiles indexes
CREATE INDEX idx_profiles_email ON profiles(email);
CREATE INDEX idx_profiles_role ON profiles(role);
CREATE INDEX idx_profiles_subscription_tier ON profiles(subscription_tier);

-- Business entities indexes  
CREATE INDEX idx_business_entities_owner ON business_entities(owner_id);
CREATE INDEX idx_business_entities_category ON business_entities(category);
CREATE INDEX idx_business_entities_status ON business_entities(status);
CREATE INDEX idx_business_entities_created ON business_entities(created_at DESC);

-- Activities indexes
CREATE INDEX idx_activities_user ON activities(user_id);
CREATE INDEX idx_activities_entity ON activities(entity_id);
CREATE INDEX idx_activities_created ON activities(created_at DESC);
CREATE INDEX idx_activities_action ON activities(action);

-- Subscriptions indexes
CREATE INDEX idx_subscriptions_user ON subscriptions(user_id);
CREATE INDEX idx_subscriptions_status ON subscriptions(status);
CREATE INDEX idx_subscriptions_stripe_customer ON subscriptions(stripe_customer_id);

-- Full-text search index for business entities
CREATE INDEX idx_business_entities_search ON business_entities 
USING gin(to_tsvector('english', name || ' ' || COALESCE(description, '')));

-- =============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =============================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE business_entities ENABLE ROW LEVEL SECURITY;
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view own profile" ON profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
    FOR UPDATE USING (auth.uid() = id);

-- Business entities policies
CREATE POLICY "Users can view own entities" ON business_entities
    FOR SELECT USING (auth.uid() = owner_id);

CREATE POLICY "Users can insert own entities" ON business_entities
    FOR INSERT WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Users can update own entities" ON business_entities
    FOR UPDATE USING (auth.uid() = owner_id);

CREATE POLICY "Users can delete own entities" ON business_entities
    FOR DELETE USING (auth.uid() = owner_id);

-- Activities policies
CREATE POLICY "Users can view own activities" ON activities
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own activities" ON activities
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Subscriptions policies
CREATE POLICY "Users can view own subscription" ON subscriptions
    FOR SELECT USING (auth.uid() = user_id);

-- =============================================
-- TRIGGERS FOR AUTO-UPDATING
-- =============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply triggers
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_business_entities_updated_at BEFORE UPDATE ON business_entities
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_subscriptions_updated_at BEFORE UPDATE ON subscriptions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- AUTO-CREATE PROFILE ON SIGNUP
-- =============================================

-- Function to create profile when user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', '')
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to auto-create profile
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =============================================
-- SAMPLE DATA (OPTIONAL)
-- =============================================

-- Insert sample categories for business entities
INSERT INTO business_entities (name, description, category, owner_id) VALUES
    ('Sample Service', 'This is a sample service entity', 'service', auth.uid()),
    ('Sample Product', 'This is a sample product entity', 'product', auth.uid()),
    ('Sample Consulting', 'This is a sample consulting entity', 'consulting', auth.uid())
ON CONFLICT DO NOTHING;

-- =============================================
-- SUCCESS MESSAGE
-- =============================================

-- If you see this comment, the setup was successful! 🎉
-- Your 3ASYAPP template database is ready to use.
-- You can now start your application with: npm run dev
```

### Step 4: Verify Setup
1. Go to Supabase Dashboard → Authentication → Users
2. Go to Database → Tables - you should see the new tables
3. Test the app: `npm run dev`

## 🔐 Authentication Flow (Already Built-in)

The template automatically handles:

### **User Registration**
```typescript
// This is already in the template - users get:
const { data, error } = await supabase.auth.signUp({
  email: 'user@example.com',
  password: 'secure-password',
  options: {
    data: {
      full_name: 'John Doe',
      company: 'ACME Corp'
    }
  }
})
// Profile automatically created via trigger
```

### **User Login** 
```typescript
// Built-in login flow
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'user@example.com',
  password: 'secure-password'
})
```

### **OAuth (Google, GitHub, etc.)**
```typescript
// Ready to use OAuth
const { data, error } = await supabase.auth.signInWithOAuth({
  provider: 'google'
})
```

## 🛡️ Security (Pre-configured)

### **Row Level Security**
- ✅ Users can only see their own data
- ✅ Automatic data isolation
- ✅ No additional code needed

### **Protected Routes**  
```typescript
// Already implemented in template
<ProtectedRoute>
  <Dashboard />
</ProtectedRoute>
```

## 📊 What Users Get Out of the Box

### **Immediate Features**
- ✅ Complete user registration/login system
- ✅ User profiles with customizable fields  
- ✅ Business entities CRUD operations
- ✅ Activity logging and audit trails
- ✅ Subscription management ready
- ✅ Role-based access control

### **Zero Configuration**
- ✅ Database structure pre-built
- ✅ Security policies configured
- ✅ API hooks ready to use
- ✅ UI components connected

### **Production Ready**
- ✅ Optimized database indexes
- ✅ Full-text search ready
- ✅ Auto-updating timestamps
- ✅ Data validation built-in

## 🎯 For Different Use Cases

### **E-commerce**
- Replace `business_entities` with `products`
- Add fields: `price`, `inventory`, `images`

### **CRM**
- Replace `business_entities` with `customers`  
- Add fields: `phone`, `address`, `lead_status`

### **Project Management**
- Replace `business_entities` with `projects`
- Add fields: `deadline`, `priority`, `team_members`

### **Any Business**
- The generic structure adapts to any use case
- Just customize the fields and labels

---

**🎉 That's it!** 
New users get a complete authentication system and database in 5 minutes.

**Need setup help?** Professional Plan includes:
- Personal setup assistance
- Custom database design
- Authentication customization  
- Production deployment help

---

*Template by Michele Miky Monti – Pragmatic product & tech patterns (auth + data made simple)* 🔐
