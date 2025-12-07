Product Management Frontend (Next.js + NextAuth + React Query)

This is the frontend dashboard for the Full Stack Product Management Application.
It allows authenticated users to manage products, upload images, update details, and manage the cart.

The frontend is built using:
    Next.js (App Router)
    NextAuth (Credentials Provider)
    React Query
    TailwindCSS + ShadCN UI
    Framer Motion for animations
    Axios for API calls
    Image previews with local object URLs

Features
    1. Authentication
        NextAuth Credentials Provider
        Simple login with email & password
        User ID passed to backend via: x-user-id: <user-id>
    2. Product Management
        Create product (name, price, description, upload multiple images)
        Edit product (keep/remove existing images, upload new ones)
        Delete product with confirmation dialog
        View product details page
        Fully validated forms using Zod
    3. Image Handling
        Preview selected images before upload
        Remove images dynamically
        Minimum 3 images required when creating or editing
    4. Cart Functionality
        Add to cart
        Remove from cart
        Update quantity
        Cart stored per authenticated user
    5. UI/UX
        Clean dashboard layout
        Product table with search, pagination & sorting
        Responsive forms
        Compact image previews
    6. Animations (Framer Motion)
        Smooth page and section transitions
        Hover zoom effects on product images
        Subtle fade/slide animations for product cards and modals
        Enhances perceived performance and overall UX

    
Installation & Setup
    1. Clone the repo
        git clone https://github.com/yourusername/product-management-frontend
        cd product-management-frontend
    2. Install dependencies
        npm install
    3. Start development server
        npm run dev
    4. Frontend runs at:
        http://localhost:3000
        
Integration With Backend
    For every authenticated request, the frontend sends: x-user-id: session.user.id

