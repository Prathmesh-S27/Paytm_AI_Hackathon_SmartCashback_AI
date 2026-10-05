import uuid
import random
from datetime import datetime, timedelta, timezone
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.models import *
from app.core.config import settings
from app.services.geo_service import calculate_bucket_bounds

# Realistic merchant name templates per category
MERCHANT_NAMES = {
    'Restaurant': ['Spice Garden', 'Masala Kitchen', 'Royal Dining', 'Tandoor Express', 'Saffron Table'],
    'Cafe': ['Bean & Brew', 'Coffee Culture', 'The Roastery', 'Chai Point'],
    'Fast Food': ['Quick Bites', 'Burger Junction', 'Wrap & Roll'],
    'Ice Cream': ['Frozen Bliss', 'Cream Corner', 'Scoop Station'],
    'Beverages': ['Juice Junction', 'Smoothie Bar', 'Fresh Press'],
    'Clothing': ['Urban Threads', 'Fashion Hub', 'Style Street', 'Trendy Wardrobe'],
    'Footwear': ['Step In Style', 'Sole Studio', 'Shoe Palace'],
    'Electronics': ['TechHub', 'Gadget World', 'DigiMart'],
    'Grocery': ['Fresh Mart', 'Daily Needs', 'Green Basket'],
    'Salon': ['Style Studio', 'Glamour Cuts', 'The Look'],
    'Beauty': ['Glow Beauty', 'Radiance Spa', 'Beauty Bliss'],
    'Pharmacy': ['MedPlus', 'Health First', 'CarePoint'],
    'Fitness/Gym': ['FitZone', 'PowerHouse Gym', 'Iron Temple'],
    'Entertainment': ['Fun Factory', 'Game Zone', 'Star Entertainment'],
    'Mobile/Accessories': ['Phone Planet', 'Mobile Hub', 'GadgetPro'],
    'Bakery': ['Oven Fresh', 'Sweet Crust', 'The Bake House'],
    'Supermarket': ['MegaMart', 'SuperSave', 'BigBasket Store'],
    'Hotel': ['Grand Stay', 'Comfort Inn', 'Royal Residency'],
    'Cab/Taxi': ['QuickRide', 'CityTaxi', 'FastCab'],
    'Car Rental': ['DriveEasy', 'RentACar', 'AutoRental'],
    'Jewelry': ['Golden Touch', 'Gem Palace', 'Silver Shine'],
    'Travel': ['WanderLust', 'TripMaker', 'Journey Hub'],
    'Services': ['FixIt Pro', 'HomeServe', 'QuickFix'],
    'Home & Furniture': ['HomeLux', 'Furniture Hub', 'DreamDecor'],
}

# Indian names for demo users
FIRST_NAMES = ['Aarav', 'Vivaan', 'Aditya', 'Vihaan', 'Arjun', 'Sai', 'Reyansh', 'Ayaan',
               'Krishna', 'Ishaan', 'Saanvi', 'Ananya', 'Diya', 'Aadhya', 'Isha', 'Pari',
               'Kavya', 'Myra', 'Sara', 'Riya', 'Rohan', 'Amit', 'Suresh', 'Neha', 'Meera',
               'Vikram', 'Deepak', 'Pooja', 'Sneha', 'Tanvi', 'Harsh', 'Kunal', 'Simran',
               'Preeti', 'Manish', 'Gaurav', 'Ankita', 'Varun', 'Shruti', 'Nikhil']
LAST_NAMES = ['Sharma', 'Patel', 'Singh', 'Kumar', 'Gupta', 'Joshi', 'Desai', 'Rao',
              'Verma', 'Iyer', 'Nair', 'Reddy', 'Shah', 'Mehta', 'Kapoor', 'Agarwal',
              'Chatterjee', 'Mukherjee', 'Das', 'Kulkarni', 'Patil', 'Shetty', 'Menon',
              'Pillai', 'Bhat', 'Hegde', 'Naik', 'Deshpande', 'Tiwari', 'Pandey']


def run_seed():
    db_url = settings.SYNC_DATABASE_URL
    engine = create_engine(db_url)
    Session = sessionmaker(bind=engine)
    db = Session()
    
    print("Starting seed process...")
    
    # Category Relationships
    rels = [
        ('Restaurant', 'Cafe', 0.9), ('Restaurant', 'Fast Food', 0.85),
        ('Restaurant', 'Ice Cream', 0.8), ('Restaurant', 'Beverages', 0.75), ('Restaurant', 'Bakery', 0.7),
        ('Cafe', 'Restaurant', 0.9), ('Cafe', 'Ice Cream', 0.8), ('Cafe', 'Beverages', 0.85), ('Cafe', 'Bakery', 0.75),
        ('Fast Food', 'Restaurant', 0.8), ('Fast Food', 'Cafe', 0.75), ('Fast Food', 'Beverages', 0.8), ('Fast Food', 'Ice Cream', 0.7),
        ('Ice Cream', 'Cafe', 0.8), ('Ice Cream', 'Restaurant', 0.6), ('Ice Cream', 'Beverages', 0.75), ('Ice Cream', 'Bakery', 0.7),
        ('Clothing', 'Footwear', 0.9), ('Clothing', 'Jewelry', 0.8), ('Clothing', 'Beauty', 0.7), ('Clothing', 'Salon', 0.65),
        ('Footwear', 'Clothing', 0.9), ('Footwear', 'Jewelry', 0.7),
        ('Electronics', 'Mobile/Accessories', 0.9),
        ('Mobile/Accessories', 'Electronics', 0.9),
        ('Grocery', 'Supermarket', 0.95), ('Grocery', 'Bakery', 0.7),
        ('Supermarket', 'Grocery', 0.95), ('Supermarket', 'Bakery', 0.6),
        ('Salon', 'Beauty', 0.9), ('Salon', 'Fitness/Gym', 0.6),
        ('Beauty', 'Salon', 0.9), ('Beauty', 'Clothing', 0.7), ('Beauty', 'Jewelry', 0.65),
        ('Fitness/Gym', 'Salon', 0.6), ('Fitness/Gym', 'Beverages', 0.5),
        ('Hotel', 'Restaurant', 0.85), ('Hotel', 'Cab/Taxi', 0.8), ('Hotel', 'Travel', 0.9),
        ('Entertainment', 'Restaurant', 0.7), ('Entertainment', 'Cafe', 0.65), ('Entertainment', 'Beverages', 0.6),
        ('Jewelry', 'Clothing', 0.8), ('Jewelry', 'Beauty', 0.7),
        ('Bakery', 'Cafe', 0.8), ('Bakery', 'Ice Cream', 0.7), ('Bakery', 'Restaurant', 0.5),
        ('Travel', 'Hotel', 0.9), ('Travel', 'Cab/Taxi', 0.85), ('Travel', 'Car Rental', 0.8),
        ('Cab/Taxi', 'Travel', 0.8), ('Cab/Taxi', 'Hotel', 0.7),
    ]
    for src, tgt, strength in rels:
        db.add(CategoryRelationship(source_category=src, related_category=tgt, strength=strength))
    
    print("  - Category relationships seeded")

    # Key Demo Users
    user1_id = uuid.uuid4()
    user2_id = uuid.uuid4()
    admin_id = uuid.uuid4()
    
    users = [
        User(id=user1_id, name="Rahul Sharma", email="rahul@demo.com", phone="+91-9876543210", role="customer", latitude=19.1197, longitude=72.8464),
        User(id=user2_id, name="Priya Patel", email="priya@demo.com", phone="+91-9876543211", role="customer", latitude=19.0596, longitude=72.8656),
        User(id=admin_id, name="Platform Admin", email="admin@demo.com", phone="+91-9876543213", role="admin"),
    ]
    
    # Generate 96 more customers with Indian names
    customer_ids = [user1_id, user2_id]
    used_names = set()
    for i in range(96):
        uid = uuid.uuid4()
        customer_ids.append(uid)
        while True:
            first = random.choice(FIRST_NAMES)
            last = random.choice(LAST_NAMES)
            name = f"{first} {last}"
            if name not in used_names:
                used_names.add(name)
                break
        users.append(User(
            id=uid, name=name, email=f"{first.lower()}.{last.lower()}{i}@demo.com",
            role="customer",
            latitude=19.0 + random.uniform(0.0, 0.15),
            longitude=72.8 + random.uniform(0.0, 0.15)
        ))
        
    db.add_all(users)
    db.commit()
    print(f"  - {len(users)} users seeded")

    # Centers for generating merchants (Mumbai)
    centers_data = [
        ("Andheri", "Mumbai", 19.1197, 72.8464),
        ("Bandra-Kurla", "Mumbai", 19.0596, 72.8656),
        ("Powai", "Mumbai", 19.1176, 72.9060),
    ]
    
    # Category config: (merchant_count, min_avg_bill, max_avg_bill)
    cats_config = {
        'Restaurant': (3, 800, 2000),
        'Cafe': (2, 200, 600),
        'Fast Food': (2, 150, 400),
        'Ice Cream': (2, 100, 300),
        'Beverages': (1, 100, 250),
        'Clothing': (2, 2000, 8000),
        'Footwear': (2, 1500, 5000),
        'Electronics': (2, 5000, 50000),
        'Grocery': (2, 500, 3000),
        'Salon': (1, 500, 2000),
        'Beauty': (1, 500, 2000),
        'Pharmacy': (1, 200, 1000),
        'Fitness/Gym': (1, 1000, 3000),
        'Entertainment': (1, 500, 1500),
        'Mobile/Accessories': (1, 500, 2000),
        'Bakery': (1, 150, 500),
        'Jewelry': (1, 5000, 30000),
        'Hotel': (1, 3000, 15000),
    }

    all_merchants = []
    owner_users = []
    for b_name, b_city, b_lat, b_lng in centers_data:
        
        merchant_count = 0
        for cat, (count, min_val, max_val) in cats_config.items():
            names = MERCHANT_NAMES.get(cat, [f'{cat} Shop'])
            for i in range(count):
                avg_bill = round(random.uniform(min_val, max_val), 2)
                m_name_base = names[i % len(names)]
                m_name = f"{m_name_base} {b_name}"
                
                owner_id = uuid.uuid4()
                owner = User(
                    id=owner_id, 
                    name=f"{m_name} Owner", 
                    email=f"owner_{len(all_merchants)}@demo.com", 
                    phone=f"+91-98{random.randint(10000000, 99999999)}", 
                    role="merchant"
                )
                owner_users.append(owner)

                m = Merchant(
                    id=uuid.uuid4(),
                    name=m_name,
                    category=cat,
                    description=f"A popular {cat.lower()} establishment in {b_name}, Mumbai",
                    latitude=b_lat + random.uniform(-0.015, 0.015),
                    longitude=b_lng + random.uniform(-0.015, 0.015),
                    address=f"{random.randint(1, 500)}, {b_name} Main Road, Mumbai - {random.randint(400050, 400099)}",
                    phone=f"+91-22-{random.randint(2000, 9999)}{random.randint(1000, 9999)}",
                    average_bill=avg_bill,
                    minimum_bill=round(avg_bill * 0.4, 2),
                    maximum_bill=round(avg_bill * 2.5, 2),
                    cashback_percentage=round(random.uniform(5, 20), 1),
                    rating=round(random.uniform(3.5, 4.8), 1),
                    total_transactions=random.randint(50, 500),
                    total_customers=random.randint(20, 200),
                    owner_id=owner_id,
                )
                all_merchants.append(m)
                merchant_count += 1
        
    db.add_all(owner_users)
    db.commit()
    print(f"  - {len(owner_users)} additional merchant owners seeded")

    db.add_all(all_merchants)
    db.commit()
    print(f"  - {len(all_merchants)} merchants seeded across centers")

    # Coupons
    coupons = []
    for m in all_merchants:
        if random.random() > 0.4:  # ~60% of merchants get a coupon
            ctype = random.choice(['percentage', 'flat'])
            if ctype == 'percentage':
                val = random.choice([10, 15, 20, 25])
                title = f"{val}% OFF at {m.name}"
                max_disc = round(m.average_bill * 0.3, 0)
            else:
                val = random.choice([100, 200, 300, 500])
                title = f"Rs{val} OFF at {m.name}"
                max_disc = val
            
            c = Coupon(
                id=uuid.uuid4(),
                merchant_id=m.id,
                category=m.category,
                title=title,
                description=f"Get {title.split(' at ')[0]} on your next visit",
                discount_type=ctype,
                discount_value=val,
                minimum_transaction_amount=round(m.average_bill * 0.7, 0),
                maximum_discount=max_disc,
                valid_from=datetime.now(timezone.utc) - timedelta(days=5),
                valid_until=datetime.now(timezone.utc) + timedelta(days=random.randint(15, 60)),
                usage_limit=random.choice([50, 100, 200]),
                user_usage_limit=random.choice([1, 2, 3]),
            )
            coupons.append(c)
    db.add_all(coupons)
    db.commit()
    print(f"  - {len(coupons)} coupons seeded")

    # Transactions
    transactions = []
    profiles = {}  # (user_id, category) -> {count, sum, amounts}
    merch_stats = {m.id: {'rev': 0.0, 'tx': 0, 'cb': 0.0, 'users': set()} for m in all_merchants}
    
    def add_tx(uid, m, amt):
        amt = round(amt, 2)
        tx = Transaction(
            id=uuid.uuid4(),
            user_id=uid,
            merchant_id=m.id,
            merchant_category=m.category,
            amount=amt,
            payment_status='completed',
            cashback_amount=round(amt * (m.cashback_percentage / 100.0), 2),
            created_at=datetime.now(timezone.utc) - timedelta(
                days=random.randint(0, 90),
                hours=random.randint(8, 22),
                minutes=random.randint(0, 59)
            )
        )
        transactions.append(tx)
        
        pkey = (uid, m.category)
        if pkey not in profiles:
            profiles[pkey] = {'count': 0, 'sum': 0.0, 'amounts': []}
        profiles[pkey]['count'] += 1
        profiles[pkey]['sum'] += amt
        profiles[pkey]['amounts'].append(amt)
        
        merch_stats[m.id]['rev'] += amt
        merch_stats[m.id]['tx'] += 1
        merch_stats[m.id]['cb'] += tx.cashback_amount
        merch_stats[m.id]['users'].add(uid)

    # Demo user Rahul: specific spending pattern
    r_rests = [m for m in all_merchants if m.category == 'Restaurant']
    r_cafes = [m for m in all_merchants if m.category == 'Cafe']
    r_clothes = [m for m in all_merchants if m.category == 'Clothing']
    r_elec = [m for m in all_merchants if m.category == 'Electronics']
    r_footwear = [m for m in all_merchants if m.category == 'Footwear']
    
    # Rahul's restaurant transactions (avg ~Rs1,250)
    for _ in range(8):
        add_tx(user1_id, random.choice(r_rests), random.uniform(1000, 1500))
    # Rahul's clothing transactions (avg ~Rs5,000)
    for _ in range(3):
        add_tx(user1_id, random.choice(r_clothes), random.uniform(4000, 6000))
    # Rahul's electronics (one big purchase ~Rs15,000)
    add_tx(user1_id, random.choice(r_elec), random.uniform(13000, 17000))
    # Rahul's cafe visits (avg ~Rs400)
    for _ in range(5):
        add_tx(user1_id, random.choice(r_cafes), random.uniform(300, 500))
    
    # Demo user Priya: different pattern
    for _ in range(5):
        add_tx(user2_id, random.choice(r_clothes), random.uniform(4000, 5600))
    for _ in range(4):
        add_tx(user2_id, random.choice(r_rests), random.uniform(700, 1100))
    r_beauty = [m for m in all_merchants if m.category == 'Beauty']
    for _ in range(3):
        add_tx(user2_id, random.choice(r_beauty if r_beauty else r_rests), random.uniform(2000, 3000))
    for _ in range(2):
        add_tx(user2_id, random.choice(r_footwear), random.uniform(2000, 4000))

    # Other customers: random realistic transactions
    for uid in customer_ids[2:]:
        num_txns = random.randint(5, 25)
        for _ in range(num_txns):
            m = random.choice(all_merchants)
            amt = random.uniform(m.minimum_bill, m.maximum_bill)
            add_tx(uid, m, amt)
            
    db.add_all(transactions)
    print(f"  - {len(transactions)} transactions seeded")
    
    # User Category Profiles
    profile_objs = []
    for (uid, cat), data in profiles.items():
        amounts = sorted(data['amounts'])
        median = amounts[len(amounts) // 2] if amounts else 0
        p = UserCategoryProfile(
            user_id=uid,
            category=cat,
            transaction_count=data['count'],
            total_spend=round(data['sum'], 2),
            average_spend=round(data['sum'] / data['count'], 2),
            median_spend=round(median, 2),
            min_spend=round(min(amounts), 2),
            max_spend=round(max(amounts), 2),
            last_transaction_date=datetime.now(timezone.utc) - timedelta(days=random.randint(0, 30))
        )
        profile_objs.append(p)
    db.add_all(profile_objs)
    print(f"  - {len(profile_objs)} user category profiles seeded")
        
    # Merchant Statistics
    stat_objs = []
    for mid, st in merch_stats.items():
        if st['tx'] > 0:
            ms = MerchantStatistics(
                merchant_id=mid,
                average_spend=round(st['rev'] / st['tx'], 2),
                median_spend=round(st['rev'] / st['tx'], 2),  # simplified
                transaction_count=st['tx'],
                customer_count=len(st['users']),
                total_revenue=round(st['rev'], 2),
                repeat_customer_count=max(0, len(st['users']) - st['tx'] // 3),
                avg_cashback=round(st['cb'] / st['tx'], 2),
                coupon_redemption_rate=round(random.uniform(0.05, 0.3), 2),
            )
            stat_objs.append(ms)
    db.add_all(stat_objs)
    print(f"  - {len(stat_objs)} merchant statistics seeded")
            
    db.commit()
    engine.dispose()
    print("\nSeeding complete! Database is ready for demo.")
    print(f"\nSummary:")
    print(f"   Users: {len(users)}")
    print(f"   Merchants: {len(all_merchants)}")
    print(f"   Transactions: {len(transactions)}")
    print(f"   Coupons: {len(coupons)}")

    print(f"   Category Relationships: {len(rels)}")

if __name__ == "__main__":
    run_seed()
