"""Mock Toyota vehicle data for the database."""

import json

TOYOTA_VEHICLES = [
    {
        "model": "Camry",
        "year": 2024,
        "trim": "LE",
        "price": 26420,
        "drivetrain": "FWD",
        "mpg_city": 28,
        "mpg_highway": 39,
        "mpg_combined": 32,
        "engine": "2.5L 4-Cylinder",
        "transmission": "8-Speed Automatic",
        "seating": 5,
        "cargo_volume": 15.1,
        "towing_capacity": 1000,
        "safety_rating": 5.0,
        "image_url": "https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?w=800",
        "category": "Sedan",
        "features": json.dumps([
            "Toyota Safety Sense 2.5+",
            "7-inch Touchscreen",
            "Apple CarPlay",
            "Android Auto",
            "Adaptive Cruise Control"
        ])
    },
    {
        "model": "Camry",
        "year": 2024,
        "trim": "XSE V6",
        "price": 36015,
        "drivetrain": "FWD",
        "mpg_city": 22,
        "mpg_highway": 33,
        "mpg_combined": 26,
        "engine": "3.5L V6",
        "transmission": "8-Speed Automatic",
        "seating": 5,
        "cargo_volume": 15.1,
        "towing_capacity": 1000,
        "safety_rating": 5.0,
        "image_url": "https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?w=800",
        "category": "Sedan",
        "features": json.dumps([
            "Toyota Safety Sense 2.5+",
            "9-inch Touchscreen",
            "JBL Premium Audio",
            "Panoramic Roof",
            "Leather Seats",
            "Wireless Charging"
        ])
    },
    {
        "model": "Corolla",
        "year": 2024,
        "trim": "LE",
        "price": 23145,
        "drivetrain": "FWD",
        "mpg_city": 32,
        "mpg_highway": 41,
        "mpg_combined": 35,
        "engine": "2.0L 4-Cylinder",
        "transmission": "CVT",
        "seating": 5,
        "cargo_volume": 13.1,
        "towing_capacity": 0,
        "safety_rating": 5.0,
        "image_url": "https://images.unsplash.com/photo-1623869675781-80aa31012a5a?w=800",
        "category": "Sedan",
        "features": json.dumps([
            "Toyota Safety Sense 3.0",
            "8-inch Touchscreen",
            "Apple CarPlay",
            "Android Auto",
            "LED Headlights"
        ])
    },
    {
        "model": "RAV4",
        "year": 2024,
        "trim": "LE",
        "price": 28675,
        "drivetrain": "AWD",
        "mpg_city": 27,
        "mpg_highway": 35,
        "mpg_combined": 30,
        "engine": "2.5L 4-Cylinder",
        "transmission": "8-Speed Automatic",
        "seating": 5,
        "cargo_volume": 37.6,
        "towing_capacity": 1500,
        "safety_rating": 5.0,
        "image_url": "https://images.unsplash.com/photo-1706509234538-9831b1b33d66?w=800&auto=format&q=80",
        "category": "SUV",
        "features": json.dumps([
            "Toyota Safety Sense 2.0",
            "7-inch Touchscreen",
            "All-Wheel Drive",
            "Apple CarPlay",
            "Android Auto"
        ])
    },
    {
        "model": "RAV4",
        "year": 2024,
        "trim": "Limited",
        "price": 37455,
        "drivetrain": "AWD",
        "mpg_city": 27,
        "mpg_highway": 35,
        "mpg_combined": 30,
        "engine": "2.5L 4-Cylinder",
        "transmission": "8-Speed Automatic",
        "seating": 5,
        "cargo_volume": 37.6,
        "towing_capacity": 1500,
        "safety_rating": 5.0,
        "image_url":"https://www.buyatoyota.com/sharpr/vcr/adobe/dynamicmedia/deliver/urn:aaid:aem:c4470c24-0745-4a6e-8096-42d2e2ea0b4f/image.png?wid=1200&hei=675&fmt=webp",
        "category": "SUV",
        "features": json.dumps([
            "Toyota Safety Sense 2.0",
            "11-speaker JBL Audio",
            "Panoramic Sunroof",
            "Leather Seats",
            "Hands-Free Power Liftgate",
            "Digital Rearview Mirror"
        ])
    },
    {
        "model": "Highlander",
        "year": 2024,
        "trim": "L",
        "price": 37935,
        "drivetrain": "AWD",
        "mpg_city": 22,
        "mpg_highway": 29,
        "mpg_combined": 25,
        "engine": "2.4L Turbo 4-Cylinder",
        "transmission": "8-Speed Automatic",
        "seating": 8,
        "cargo_volume": 16.0,
        "towing_capacity": 5000,
        "safety_rating": 5.0,
        "image_url": "https://images.unsplash.com/photo-1606611013016-969c19f2e9e3?w=800",
        "category": "SUV",
        "features": json.dumps([
            "Toyota Safety Sense 2.5+",
            "8-inch Touchscreen",
            "Three-Row Seating",
            "All-Wheel Drive",
            "Apple CarPlay"
        ])
    },
    {
        "model": "Prius",
        "year": 2024,
        "trim": "LE",
        "price": 27950,
        "drivetrain": "FWD",
        "mpg_city": 57,
        "mpg_highway": 56,
        "mpg_combined": 57,
        "engine": "2.0L 4-Cylinder Hybrid",
        "transmission": "CVT",
        "seating": 5,
        "cargo_volume": 23.8,
        "towing_capacity": 0,
        "safety_rating": 5.0,
        "image_url": "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800",
        "category": "Hybrid",
        "features": json.dumps([
            "Toyota Safety Sense 3.0",
            "8-inch Touchscreen",
            "Wireless Apple CarPlay",
            "Android Auto",
            "Hybrid Synergy Drive"
        ])
    },
    {
        "model": "Tacoma",
        "year": 2024,
        "trim": "SR5",
        "price": 38190,
        "drivetrain": "4WD",
        "mpg_city": 19,
        "mpg_highway": 24,
        "mpg_combined": 21,
        "engine": "2.4L Turbo 4-Cylinder",
        "transmission": "8-Speed Automatic",
        "seating": 5,
        "cargo_volume": 0,
        "towing_capacity": 6500,
        "safety_rating": 4.5,
        "image_url": "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=800",
        "category": "Truck",
        "features": json.dumps([
            "Toyota Safety Sense 2.5",
            "8-inch Touchscreen",
            "4-Wheel Drive",
            "Tow Package",
            "Bed Liner"
        ])
    },
    {
        "model": "Tundra",
        "year": 2024,
        "trim": "SR5",
        "price": 49990,
        "drivetrain": "4WD",
        "mpg_city": 18,
        "mpg_highway": 24,
        "mpg_combined": 20,
        "engine": "3.4L Twin-Turbo V6 Hybrid",
        "transmission": "10-Speed Automatic",
        "seating": 5,
        "cargo_volume": 0,
        "towing_capacity": 12000,
        "safety_rating": 4.5,
        "image_url": "https://images.unsplash.com/photo-1581235720704-06d3acfcb36f?w=800",
        "category": "Truck",
        "features": json.dumps([
            "Toyota Safety Sense 2.5",
            "14-inch Touchscreen",
            "4-Wheel Drive",
            "Integrated Trailer Brake Controller",
            "Power Tailgate"
        ])
    },
    {
        "model": "4Runner",
        "year": 2024,
        "trim": "SR5",
        "price": 41015,
        "drivetrain": "4WD",
        "mpg_city": 16,
        "mpg_highway": 19,
        "mpg_combined": 17,
        "engine": "4.0L V6",
        "transmission": "5-Speed Automatic",
        "seating": 7,
        "cargo_volume": 47.2,
        "towing_capacity": 5000,
        "safety_rating": 4.0,
        "image_url": "https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?w=800",
        "category": "SUV",
        "features": json.dumps([
            "Toyota Safety Sense",
            "8-inch Touchscreen",
            "4-Wheel Drive",
            "Crawl Control",
            "Multi-Terrain Select"
        ])
    },
    {
        "model": "Sienna",
        "year": 2024,
        "trim": "LE",
        "price": 37685,
        "drivetrain": "FWD",
        "mpg_city": 36,
        "mpg_highway": 36,
        "mpg_combined": 36,
        "engine": "2.5L 4-Cylinder Hybrid",
        "transmission": "CVT",
        "seating": 8,
        "cargo_volume": 33.5,
        "towing_capacity": 3500,
        "safety_rating": 5.0,
        "image_url": "https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=800",
        "category": "Minivan",
        "features": json.dumps([
            "Toyota Safety Sense 2.0",
            "9-inch Touchscreen",
            "Power Sliding Doors",
            "All-Wheel Drive Available",
            "Apple CarPlay"
        ])
    },
    {
        "model": "GR86",
        "year": 2024,
        "trim": "Premium",
        "price": 32300,
        "drivetrain": "RWD",
        "mpg_city": 20,
        "mpg_highway": 27,
        "mpg_combined": 22,
        "engine": "2.4L Flat-4",
        "transmission": "6-Speed Manual",
        "seating": 4,
        "cargo_volume": 6.3,
        "towing_capacity": 0,
        "safety_rating": 4.5,
        "image_url": "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=800",
        "category": "Sports",
        "features": json.dumps([
            "Track-Tuned Suspension",
            "8-inch Touchscreen",
            "Sport Seats",
            "Limited-Slip Differential",
            "Performance Tires"
        ])
    }
]

def populate_database(db):
    from . import models

    KEY = ("model", "year", "trim")  # unique key for a vehicle

    for data in TOYOTA_VEHICLES:
        q = {k: data[k] for k in KEY}
        row = db.query(models.Vehicle).filter_by(**q).first()
        if row:
            # update all columns, including image_url
            for k, v in data.items():
                setattr(row, k, v)
        else:
            db.add(models.Vehicle(**data))
    db.commit()
    return True

