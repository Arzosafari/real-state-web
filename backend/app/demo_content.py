"""Illustrative demo content.

Everything here is placeholder material for a layout demonstration. Records are
seeded with ``is_demo = True`` so the administrator can see exactly what to
replace — or purge in one action from the dashboard — before launch. No claim
about real projects, performance, media coverage or people is made anywhere.
"""

from __future__ import annotations

from datetime import date

IMAGE_BASE = "/images"

DEFAULT_SETTINGS: dict = {
    "brand": {
        "name": "UrbanLedge",
        "tagline": "People. Places. Possibility.",
        "legal_name": "UrbanLedge (demo content)",
        "disclosure": "Demonstration website. Projects, listings and statistics are illustrative.",
    },
    "contact": {
        "email": "hello@urbanledge.example",
        "phone": "+65 0000 0000",
        "address": "Level 12, 1 Market Square, Singapore 048946",
        "hours": "Monday to Friday, 09:00 – 18:00 (SGT)",
        "map_note": "An interactive map appears once a verified address is configured.",
    },
    "social": {
        "linkedin": "#",
        "instagram": "#",
        "youtube": "#",
    },
    "locale": {"currency": "USD", "timezone": "Asia/Singapore"},
    "navigation": [
        {"label": "Home", "to": "/"},
        {"label": "About", "to": "/about"},
        {"label": "Projects", "to": "/projects"},
        {"label": "Services", "to": "/services"},
        {"label": "Approach", "to": "/approach"},
        {"label": "Insights", "to": "/insights"},
        {"label": "Contact", "to": "/contact"},
    ],
    "footer": {
        "statement": "A more livable tomorrow.",
        "columns": [
            {
                "title": "Explore",
                "links": [
                    {"label": "Projects", "to": "/projects"},
                    {"label": "Properties", "to": "/properties"},
                    {"label": "Gallery", "to": "/gallery"},
                    {"label": "Insights", "to": "/insights"},
                ],
            },
            {
                "title": "Company",
                "links": [
                    {"label": "About", "to": "/about"},
                    {"label": "Services", "to": "/services"},
                    {"label": "Our approach", "to": "/approach"},
                    {"label": "Book a consultation", "to": "/book-consultation"},
                ],
            },
            {
                "title": "Information",
                "links": [
                    {"label": "Contact", "to": "/contact"},
                    {"label": "Privacy policy", "to": "/privacy"},
                    {"label": "Terms of use", "to": "/terms"},
                    {"label": "Sitemap", "to": "/sitemap"},
                ],
            },
        ],
    },
    "seo": {
        "title_suffix": "UrbanLedge",
        "default_description": (
            "UrbanLedge plans and develops residential and mixed-use places where "
            "architecture, community and long-term value come together."
        ),
    },
    "press": {
        "enabled": True,
        "note": "Placeholder wordmarks for layout only — no coverage is implied.",
        "publications": [
            "The Straits Times",
            "The Business Times",
            "Forbes",
            "Wallpaper*",
            "Dezeen",
            "ArchDaily",
            "Bloomberg",
        ],
    },
    "hero": {
        "eyebrow": "Architecture / Development / Stronger Cities",
        "headline": "Shaping Better Living.",
        "description": (
            "UrbanLedge designs and develops inspiring places where architecture, "
            "community, and long-term value come together."
        ),
        "image": f"{IMAGE_BASE}/hero/hero-dusk.jpg",
        "side_label": ["Places", "That", "Endure"],
        "features": [
            {"title": "Iconic design", "copy": "Timeless, context-driven architecture.", "icon": "building"},
            {"title": "Sustainable growth", "copy": "A more resilient tomorrow.", "icon": "leaf"},
            {"title": "Thriving communities", "copy": "People-centric places.", "icon": "community"},
        ],
    },
    "stats": {
        "note": "Illustrative figures for layout only — not verified company results.",
        "items": [
            {"value": "120+", "label": "Projects delivered"},
            {"value": "3.8M m²", "label": "Total development area"},
            {"value": "25+", "label": "Cities & regions"},
            {"value": "60%", "label": "Green building certified"},
        ],
        "image": f"{IMAGE_BASE}/impact/city-dusk.jpg",
    },
    "process": [
        {"step": "01", "title": "Discover", "copy": "Understand context, opportunities and goals."},
        {"step": "02", "title": "Plan", "copy": "Shape the vision through research and strategy."},
        {"step": "03", "title": "Design", "copy": "Create integrated, human-centered solutions."},
        {"step": "04", "title": "Develop", "copy": "Bring ideas to life with trusted partners."},
        {"step": "05", "title": "Deliver", "copy": "Create lasting value for people and place."},
    ],
    "philosophy": {
        "quote": (
            "Great places are shaped by their context, enriched by their communities, "
            "and built to last."
        ),
        "attribution": "UrbanLedge",
        "image": f"{IMAGE_BASE}/philosophy/terrace-pavilion.jpg",
    },
}

PROJECTS: list[dict] = [
    {
        "slug": "riverside-quarter",
        "title": "Riverside Quarter",
        "tagline": "Waterfront living stitched into the city fabric",
        "category": "Residential",
        "location": "Singapore",
        "status": "Completed",
        "featured": True,
        "display_order": 1,
        "hero_image": f"{IMAGE_BASE}/projects/riverside-quarter.jpg",
        "overview": (
            "A waterfront residential quarter of three slender towers set above a "
            "public promenade, planned so that the ground plane belongs to the city."
        ),
        "description": (
            "Demonstration project content. Riverside Quarter explores how a dense "
            "residential block can give more to its street than it takes: shaded "
            "walkways, a continuous public edge and gardens that step down to the water."
        ),
        "design_concept": (
            "The massing steps back as it rises, opening the towers to prevailing "
            "breezes and keeping the promenade in shade for most of the day."
        ),
        "highlights": [
            "Public waterfront promenade at the base",
            "Cross-ventilated apartment planning",
            "Landscaped sky terraces on every sixth level",
        ],
        "sustainability": [
            "Rainwater harvesting for irrigation of shared gardens",
            "High-albedo roof surfaces to reduce heat gain",
        ],
        "amenities": ["Residents' pool", "Community pavilion", "Running loop", "Retail arcade"],
        "specifications": [
            {"label": "Units", "value": "486"},
            {"label": "Site area", "value": "21,400 m²"},
            {"label": "Completion", "value": "2023"},
        ],
        "services": ["architecture", "property-development", "urban-planning"],
        "total_area_sqm": 96400,
        "unit_count": 486,
        "bedrooms_range": "1 – 4 bedrooms",
        "completion_date": date(2023, 6, 1),
        "developer": "Demo developer",
        "architect": "Demo design studio",
        "gallery": [
            f"{IMAGE_BASE}/projects/riverside-quarter.jpg",
            f"{IMAGE_BASE}/gallery/gallery-01.jpg",
            f"{IMAGE_BASE}/gallery/gallery-04.jpg",
        ],
    },
    {
        "slug": "azure-heights",
        "title": "Azure Heights",
        "tagline": "Hillside residences among mature tropical planting",
        "category": "Residential",
        "location": "Phuket",
        "status": "In development",
        "featured": True,
        "display_order": 2,
        "hero_image": f"{IMAGE_BASE}/projects/azure-heights.jpg",
        "overview": (
            "Forty-eight hillside residences arranged along the contour, each with "
            "outdoor rooms that open to the tree canopy."
        ),
        "description": (
            "Demonstration project content. Azure Heights demonstrates a low-rise, "
            "low-impact response to a sloping site: retained mature trees, minimal "
            "cut and fill, and shared paths instead of internal roads."
        ),
        "design_concept": (
            "Buildings follow the existing ridge lines, so the landscape reads first "
            "and the architecture second."
        ),
        "highlights": [
            "Only 48 residences across the hillside",
            "Shared elevated walkway network",
            "Every home oriented to the western view",
        ],
        "sustainability": [
            "Existing tree canopy retained across the site",
            "Passive cooling through cross-ventilation and deep eaves",
        ],
        "amenities": ["Infinity pool", "Wellness pavilion", "Nature trail"],
        "specifications": [
            {"label": "Units", "value": "48"},
            {"label": "Site area", "value": "6,900 m²"},
        ],
        "services": ["architecture", "property-development"],
        "total_area_sqm": 14200,
        "unit_count": 48,
        "bedrooms_range": "2 – 4 bedrooms",
        "completion_date": date(2027, 3, 1),
        "developer": "Demo developer",
        "architect": "Demo design studio",
        "gallery": [
            f"{IMAGE_BASE}/projects/azure-heights.jpg",
            f"{IMAGE_BASE}/gallery/gallery-05.jpg",
        ],
    },
    {
        "slug": "the-ledge",
        "title": "The Ledge",
        "tagline": "A mixed-use tower with a public life at street level",
        "category": "Mixed-use",
        "location": "Kuala Lumpur",
        "status": "In development",
        "featured": True,
        "display_order": 3,
        "hero_image": f"{IMAGE_BASE}/projects/the-ledge.jpg",
        "overview": (
            "Offices, homes and retail layered into a single volume, connected by a "
            "sequence of outdoor terraces that are open to the public."
        ),
        "description": (
            "Demonstration project content. The Ledge tests how a commercial tower can "
            "contribute a genuine public room at ground level while remaining economically "
            "efficient above."
        ),
        "design_concept": (
            "A deep structural frame shades the glazing and creates the terraces; the "
            "building's expression comes from that single move."
        ),
        "highlights": [
            "Double-height public colonnade",
            "Terraced outdoor rooms every eight floors",
            "Direct link to the transit concourse",
        ],
        "sustainability": [
            "Shading frame reduces cooling demand",
            "Mixed uses reduce reliance on private transport",
        ],
        "amenities": ["Sky lobby", "Retail podium", "Bicycle facilities"],
        "specifications": [
            {"label": "Floors", "value": "38"},
            {"label": "Site area", "value": "9,200 m²"},
        ],
        "services": ["architecture", "property-development", "advisory-asset-strategy"],
        "total_area_sqm": 78500,
        "unit_count": 312,
        "bedrooms_range": "1 – 3 bedrooms",
        "developer": "Demo developer",
        "architect": "Demo design studio",
        "gallery": [
            f"{IMAGE_BASE}/projects/the-ledge.jpg",
            f"{IMAGE_BASE}/gallery/gallery-02.jpg",
            f"{IMAGE_BASE}/gallery/gallery-06.jpg",
        ],
    },
    {
        "slug": "greenfield-residences",
        "title": "Greenfield Residences",
        "tagline": "Low-rise homes arranged around shared gardens",
        "category": "Residential",
        "location": "Johor Bahru",
        "status": "Planning",
        "featured": True,
        "display_order": 4,
        "hero_image": f"{IMAGE_BASE}/projects/greenfield-residences.jpg",
        "overview": (
            "A neighbourhood of low-rise homes with gardens, natural materials and "
            "car-free lanes between the blocks."
        ),
        "description": (
            "Demonstration project content. Greenfield Residences proposes a walkable "
            "alternative to the gated cluster, with shared courtyards and a footpath "
            "network that connects every front door to the district park."
        ),
        "design_concept": (
            "Homes are grouped in clusters of eight around a planted court, which "
            "keeps the built footprint low and the shared landscape generous."
        ),
        "highlights": ["Clusters of eight homes", "Car-free internal lanes", "Shared edible gardens"],
        "sustainability": ["Timber and locally sourced masonry", "Permeable paving throughout"],
        "amenities": ["Neighbourhood park", "Community hall", "Cycle store"],
        "specifications": [{"label": "Homes", "value": "164"}],
        "services": ["architecture", "urban-planning"],
        "total_area_sqm": 31200,
        "unit_count": 164,
        "bedrooms_range": "3 – 5 bedrooms",
        "developer": "Demo developer",
        "architect": "Demo design studio",
        "gallery": [
            f"{IMAGE_BASE}/projects/greenfield-residences.jpg",
            f"{IMAGE_BASE}/gallery/gallery-07.jpg",
        ],
    },
    {
        "slug": "harbourline-offices",
        "title": "Harbourline Offices",
        "tagline": "Workplace floors planned around daylight and air",
        "category": "Commercial",
        "location": "Singapore",
        "status": "Completed",
        "hero_image": f"{IMAGE_BASE}/projects/harbourline-offices.jpg",
        "overview": (
            "Two mid-rise workplace buildings sharing a courtyard, planned for deep "
            "daylight and natural ventilation."
        ),
        "description": (
            "Demonstration project content. Harbourline Offices explores a floorplate "
            "that can be let to one tenant or six without rebuilding the services."
        ),
        "design_concept": "A courtyard splits the mass, giving every floor two open edges.",
        "highlights": ["Column-free floorplates", "Shared planted courtyard"],
        "sustainability": ["Daylight-linked lighting control", "Rooftop photovoltaic array"],
        "amenities": ["Cycle facilities", "Courtyard café", "Shower and changing rooms"],
        "specifications": [{"label": "Floor area", "value": "41,000 m²"}],
        "services": ["architecture", "advisory-asset-strategy"],
        "total_area_sqm": 41000,
        "developer": "Demo developer",
        "architect": "Demo design studio",
        "gallery": [f"{IMAGE_BASE}/projects/harbourline-offices.jpg"],
    },
    {
        "slug": "straits-hotel-residences",
        "title": "Straits Hotel & Residences",
        "tagline": "Hospitality and homes in one waterfront address",
        "category": "Hospitality",
        "location": "Penang",
        "status": "Planning",
        "hero_image": f"{IMAGE_BASE}/projects/straits-hotel-residences.jpg",
        "overview": (
            "A waterfront hotel with serviced residences above, sharing a garden deck "
            "and a single arrival court."
        ),
        "description": (
            "Demonstration project content. The scheme tests how branded residences "
            "and a working hotel can share back-of-house functions without either "
            "compromising the guest or resident experience."
        ),
        "design_concept": "A shared podium separates public hospitality floors from the residences above.",
        "highlights": ["Shared garden deck", "Single arrival court"],
        "sustainability": ["Sea-water cooling loop (proposed)"],
        "amenities": ["Pool deck", "Spa", "Two restaurants"],
        "specifications": [{"label": "Keys", "value": "220"}],
        "services": ["architecture", "property-development", "advisory-asset-strategy"],
        "total_area_sqm": 38500,
        "developer": "Demo developer",
        "architect": "Demo design studio",
        "gallery": [f"{IMAGE_BASE}/projects/straits-hotel-residences.jpg"],
    },
    {
        "slug": "northbank-masterplan",
        "title": "Northbank Masterplan",
        "tagline": "A framework for a district that can grow in stages",
        "category": "Masterplanning",
        "location": "Kuala Lumpur",
        "status": "Available for inquiry",
        "hero_image": f"{IMAGE_BASE}/projects/northbank-masterplan.jpg",
        "overview": (
            "A district framework covering streets, open space, drainage and phasing "
            "for roughly 4,000 homes."
        ),
        "description": (
            "Demonstration project content. Northbank sets out a street grid and a "
            "public-space network that each plot can be developed against "
            "independently, years apart."
        ),
        "design_concept": "The public realm comes first; buildings fill in around it.",
        "highlights": ["Staged delivery across 12 years", "Blue-green drainage network"],
        "sustainability": ["Integrated water management", "Ten-minute walk to daily needs"],
        "amenities": ["District park", "Two primary schools (indicative)"],
        "specifications": [{"label": "Indicative homes", "value": "4,000"}],
        "services": ["urban-planning", "advisory-asset-strategy"],
        "total_area_sqm": 412000,
        "developer": "Demo developer",
        "architect": "Demo design studio",
        "gallery": [f"{IMAGE_BASE}/projects/northbank-masterplan.jpg"],
    },
    {
        "slug": "verdant-court",
        "title": "Verdant Court",
        "tagline": "Townhouses arranged around a shared green",
        "category": "Urban development",
        "location": "Johor Bahru",
        "status": "Completed",
        "hero_image": f"{IMAGE_BASE}/projects/verdant-court.jpg",
        "overview": "Sixty-two townhouses around a planted court and a small commercial frontage.",
        "description": (
            "Demonstration project content. Verdant Court shows a modest infill typology "
            "that gives each home a private outdoor room without losing the shared green."
        ),
        "design_concept": "Homes are turned to face the green, with services on the lane side.",
        "highlights": ["Shared green at the centre", "Active ground-floor frontage"],
        "sustainability": ["Deep planting for shade", "Low-flow fixtures throughout"],
        "amenities": ["Play area", "Community room"],
        "specifications": [{"label": "Homes", "value": "62"}],
        "services": ["architecture", "urban-planning"],
        "total_area_sqm": 11800,
        "developer": "Demo developer",
        "architect": "Demo design studio",
        "gallery": [f"{IMAGE_BASE}/projects/verdant-court.jpg"],
    },
]

PROPERTIES: list[dict] = [
    {
        "reference": "UL-1001",
        "title": "Three-bedroom apartment at Riverside Quarter",
        "property_type": "Apartment",
        "transaction_type": "buy",
        "listing_status": "available",
        "price": 1850000,
        "location": "Singapore",
        "address": "Riverside Quarter, Singapore",
        "area_sqm": 128,
        "bedrooms": 3,
        "bathrooms": 2,
        "furnished": "unfurnished",
        "excerpt": "River-facing apartment with a deep balcony and cross-ventilated planning.",
        "description": (
            "Demonstration listing. A three-bedroom home on the ninth level overlooking "
            "the promenade, with a deep balcony, cross-ventilated living space and access "
            "to the landscaped sky terrace."
        ),
        "amenities": ["Pool", "Gym", "Concierge", "Sky terrace", "Secure parking"],
        "images": [f"{IMAGE_BASE}/properties/apartment-riverside.jpg", f"{IMAGE_BASE}/gallery/gallery-03.jpg"],
        "featured": True,
        "project_slug": "riverside-quarter",
    },
    {
        "reference": "UL-1002",
        "title": "Penthouse at The Ledge",
        "property_type": "Penthouse",
        "transaction_type": "buy",
        "listing_status": "available",
        "price": 4600000,
        "location": "Kuala Lumpur",
        "address": "The Ledge, Kuala Lumpur",
        "area_sqm": 260,
        "bedrooms": 4,
        "bathrooms": 4,
        "furnished": "furnished",
        "excerpt": "Duplex penthouse with terrace access and city views.",
        "description": (
            "Demonstration listing. A duplex penthouse with a private terrace on the "
            "upper level, direct lift access and views across the city."
        ),
        "amenities": ["Private terrace", "Sky lobby", "Valet parking", "Concierge"],
        "images": [f"{IMAGE_BASE}/properties/penthouse-ledge.jpg"],
        "featured": True,
        "project_slug": "the-ledge",
    },
    {
        "reference": "UL-1003",
        "title": "Hillside villa at Azure Heights",
        "property_type": "Villa",
        "transaction_type": "buy",
        "listing_status": "under_offer",
        "price": 2980000,
        "location": "Phuket",
        "address": "Azure Heights, Phuket",
        "area_sqm": 320,
        "bedrooms": 4,
        "bathrooms": 4,
        "furnished": "furnished",
        "excerpt": "Villa with an infinity pool and views through mature tree canopy.",
        "description": (
            "Demonstration listing. A four-bedroom villa arranged around a courtyard, "
            "opening onto a pool deck that looks through the retained canopy to the bay."
        ),
        "amenities": ["Infinity pool", "Wellness pavilion", "Private garden"],
        "images": [f"{IMAGE_BASE}/properties/villa-azure.jpg"],
        "project_slug": "azure-heights",
    },
    {
        "reference": "UL-1004",
        "title": "Family house at Greenfield Residences",
        "property_type": "House",
        "transaction_type": "buy",
        "listing_status": "available",
        "price": 980000,
        "location": "Johor Bahru",
        "address": "Greenfield Residences, Johor Bahru",
        "area_sqm": 210,
        "bedrooms": 4,
        "bathrooms": 3,
        "furnished": "unfurnished",
        "excerpt": "Two-storey home facing a shared planted court.",
        "description": (
            "Demonstration listing. A two-storey family home with a garden room, a "
            "south-facing courtyard and direct access to the neighbourhood park."
        ),
        "amenities": ["Shared gardens", "Community hall", "Cycle store"],
        "images": [f"{IMAGE_BASE}/properties/house-greenfield.jpg"],
        "project_slug": "greenfield-residences",
    },
    {
        "reference": "UL-1005",
        "title": "Office floor at Harbourline",
        "property_type": "Office",
        "transaction_type": "rent",
        "listing_status": "available",
        "price": 42000,
        "price_period": "per month",
        "location": "Singapore",
        "address": "Harbourline Offices, Singapore",
        "area_sqm": 1150,
        "excerpt": "Column-free floor with courtyard aspect and daylight on two edges.",
        "description": (
            "Demonstration listing. A full floor of 1,150 m² with raised flooring, "
            "daylight on two elevations and a courtyard outlook."
        ),
        "amenities": ["Raised floors", "Cycle facilities", "Showers", "24h access"],
        "images": [f"{IMAGE_BASE}/properties/office-harbourline.jpg"],
        "project_slug": "harbourline-offices",
    },
    {
        "reference": "UL-1006",
        "title": "Retail unit at The Ledge podium",
        "property_type": "Retail",
        "transaction_type": "rent",
        "listing_status": "available",
        "price": 12800,
        "price_period": "per month",
        "location": "Kuala Lumpur",
        "address": "The Ledge, Kuala Lumpur",
        "area_sqm": 180,
        "excerpt": "Double-height unit on the colonnade with a wide frontage.",
        "description": (
            "Demonstration listing. A double-height retail unit opening onto the public "
            "colonnade, suitable for food and beverage or showroom use."
        ),
        "amenities": ["Double height", "Extract provision", "Bicycle parking"],
        "images": [f"{IMAGE_BASE}/properties/retail-ledge.jpg"],
        "project_slug": "the-ledge",
    },
    {
        "reference": "UL-1007",
        "title": "Townhouse at Verdant Court",
        "property_type": "Townhouse",
        "transaction_type": "buy",
        "listing_status": "sold",
        "price": 640000,
        "location": "Johor Bahru",
        "address": "Verdant Court, Johor Bahru",
        "area_sqm": 168,
        "bedrooms": 3,
        "bathrooms": 3,
        "furnished": "unfurnished",
        "excerpt": "Three-bedroom townhouse facing the shared green.",
        "description": (
            "Demonstration listing, shown as sold to illustrate the listing-status "
            "workflow. A three-bedroom townhouse with a private roof terrace."
        ),
        "amenities": ["Roof terrace", "Play area", "Community room"],
        "images": [f"{IMAGE_BASE}/properties/townhouse-verdant.jpg"],
        "project_slug": "verdant-court",
    },
    {
        "reference": "UL-1008",
        "title": "Garden apartment at Riverside Quarter",
        "property_type": "Apartment",
        "transaction_type": "rent",
        "listing_status": "available",
        "price": 5600,
        "price_period": "per month",
        "location": "Singapore",
        "address": "Riverside Quarter, Singapore",
        "area_sqm": 92,
        "bedrooms": 2,
        "bathrooms": 2,
        "furnished": "furnished",
        "excerpt": "Two-bedroom apartment with a planted terrace at the promenade level.",
        "description": (
            "Demonstration listing. A two-bedroom apartment at promenade level with a "
            "planted terrace and its own street entrance."
        ),
        "amenities": ["Private terrace", "Pool", "Concierge"],
        "images": [f"{IMAGE_BASE}/properties/apartment-garden.jpg"],
        "project_slug": "riverside-quarter",
    },
    {
        "reference": "UL-1009",
        "title": "Commercial building on Market Lane",
        "property_type": "Commercial building",
        "transaction_type": "buy",
        "listing_status": "available",
        "price": 7400000,
        "location": "Penang",
        "address": "Market Lane (indicative), Penang",
        "area_sqm": 2450,
        "excerpt": "Six-storey commercial building with ground-floor frontage.",
        "description": (
            "Demonstration listing. A six-storey commercial building with retail at "
            "ground level and flexible floors above, currently offered with vacant possession."
        ),
        "amenities": ["Lift", "Loading bay", "Bicycle parking"],
        "images": [f"{IMAGE_BASE}/properties/commercial-market-lane.jpg"],
    },
    {
        "reference": "UL-1010",
        "title": "Development land at Northbank, parcel C",
        "property_type": "Land",
        "transaction_type": "buy",
        "listing_status": "available",
        "price": 5200000,
        "location": "Kuala Lumpur",
        "address": "Northbank parcel C (indicative), Kuala Lumpur",
        "area_sqm": 18400,
        "excerpt": "Serviced parcel within the Northbank masterplan framework.",
        "description": (
            "Demonstration listing. A serviced parcel within the Northbank framework, "
            "with an indicative residential allocation. Any sale is subject to "
            "verification of title and approvals."
        ),
        "amenities": ["Serviced frontage", "District park within walking distance"],
        "images": [f"{IMAGE_BASE}/properties/land-northbank.jpg"],
        "project_slug": "northbank-masterplan",
    },
    {
        "reference": "UL-1011",
        "title": "Mixed-use corner unit at Verdant Court",
        "property_type": "Mixed-use property",
        "transaction_type": "rent",
        "listing_status": "rented",
        "price": 7400,
        "price_period": "per month",
        "location": "Johor Bahru",
        "address": "Verdant Court, Johor Bahru",
        "area_sqm": 140,
        "excerpt": "Corner unit with residential above and shopfront below.",
        "description": (
            "Demonstration listing, shown as rented to illustrate status handling. "
            "A corner mixed-use unit with a wide shopfront and a two-bedroom home above."
        ),
        "amenities": ["Shopfront", "Store", "Rear access"],
        "images": [f"{IMAGE_BASE}/properties/mixeduse-verdant.jpg"],
        "project_slug": "verdant-court",
    },
    {
        "reference": "UL-1012",
        "title": "Sea-view apartment at Straits Residences",
        "property_type": "Apartment",
        "transaction_type": "buy",
        "listing_status": "available",
        "price": 1240000,
        "location": "Penang",
        "address": "Straits Hotel & Residences (indicative), Penang",
        "area_sqm": 104,
        "bedrooms": 2,
        "bathrooms": 2,
        "furnished": "unfurnished",
        "excerpt": "Two-bedroom residence with hotel services and a sea-facing balcony.",
        "description": (
            "Demonstration listing. A two-bedroom residence on the tenth level with a "
            "sea-facing balcony and access to the shared garden deck."
        ),
        "amenities": ["Pool deck", "Spa access", "Concierge", "Housekeeping option"],
        "images": [f"{IMAGE_BASE}/properties/apartment-straits.jpg"],
        "project_slug": "straits-hotel-residences",
    },
]

SERVICES: list[dict] = [
    {
        "slug": "architecture",
        "title": "Architecture",
        "icon": "building",
        "summary": "Thoughtful, enduring design for modern life.",
        "description": (
            "We design buildings that belong to their place: residential towers, "
            "workplaces, hotels and homes planned around daylight, air and the life "
            "that will happen inside them."
        ),
        "image": f"{IMAGE_BASE}/services/architecture.jpg",
        "deliverables": [
            "Feasibility and site appraisal",
            "Concept and schematic design",
            "Design development and documentation support",
            "Construction-phase design review",
        ],
        "process": [
            {"step": "01", "title": "Brief", "copy": "Establish what the building must do."},
            {"step": "02", "title": "Schematic design", "copy": "Test massing, orientation and plan."},
            {"step": "03", "title": "Detail", "copy": "Resolve the parts people touch."},
            {"step": "04", "title": "Delivery", "copy": "Support construction with design intent."},
        ],
        "related_project_slugs": ["riverside-quarter", "the-ledge"],
        "display_order": 1,
    },
    {
        "slug": "property-development",
        "title": "Property Development",
        "icon": "layers",
        "summary": "From vision to vibrant communities.",
        "description": (
            "We take projects from a site and an idea to a place that works: "
            "programme, phasing, partnerships and the everyday management of a "
            "development budget."
        ),
        "image": f"{IMAGE_BASE}/services/development.jpg",
        "deliverables": [
            "Development strategy and programme",
            "Design team coordination",
            "Phasing and staging plans",
            "Delivery and handover planning",
        ],
        "process": [
            {"step": "01", "title": "Vision", "copy": "Agree the outcome and the constraints."},
            {"step": "02", "title": "Programme", "copy": "Sequence design, approvals and build."},
            {"step": "03", "title": "Delivery", "copy": "Manage the team and the risk."},
        ],
        "related_project_slugs": ["azure-heights", "straits-hotel-residences"],
        "display_order": 2,
    },
    {
        "slug": "urban-planning",
        "title": "Urban Planning",
        "icon": "leaf",
        "summary": "Livable, resilient, future-ready cities.",
        "description": (
            "Masterplans and district frameworks that start from movement, drainage, "
            "open space and how a place will be built out in stages over many years."
        ),
        "image": f"{IMAGE_BASE}/services/urban-planning.jpg",
        "deliverables": [
            "Structure and movement planning",
            "Public space and landscape framework",
            "Phasing and infrastructure strategy",
            "Development-control guidance",
        ],
        "process": [
            {"step": "01", "title": "Context", "copy": "Read the landscape and the city around it."},
            {"step": "02", "title": "Framework", "copy": "Set streets, open space and density."},
            {"step": "03", "title": "Guidance", "copy": "Make it buildable in stages."},
        ],
        "related_project_slugs": ["northbank-masterplan", "greenfield-residences"],
        "display_order": 3,
    },
    {
        "slug": "advisory-asset-strategy",
        "title": "Advisory & Asset Strategy",
        "icon": "chart",
        "summary": "Maximizing value through design and insight.",
        "description": (
            "Independent advice on what to build, when to build it and what the "
            "options are worth — grounded in design thinking rather than a generic model."
        ),
        "image": f"{IMAGE_BASE}/services/advisory.jpg",
        "deliverables": [
            "Highest-and-best-use studies",
            "Option appraisals and comparisons",
            "Development briefs for partners",
            "Asset repositioning advice",
        ],
        "process": [
            {"step": "01", "title": "Evidence", "copy": "Gather what is actually known."},
            {"step": "02", "title": "Options", "copy": "Test clear alternatives."},
            {"step": "03", "title": "Recommendation", "copy": "Set out the trade-offs plainly."},
        ],
        "related_project_slugs": ["harbourline-offices", "northbank-masterplan"],
        "display_order": 4,
    },
]

ARTICLES: list[dict] = [
    {
        "slug": "designing-for-the-second-decade",
        "title": "Designing for the second decade",
        "category": "Sustainable design",
        "excerpt": (
            "Demonstration article. The choices that decide how well a building ages "
            "are usually made long before anyone moves in."
        ),
        "content": (
            "Demonstration article content, written to show the layout and typography of "
            "the journal.\n\n"
            "Buildings are judged twice: on the day they open, and a decade later. The "
            "second judgement is the one that lasts, and it is decided by ordinary things — "
            "whether a shared garden still has shade at noon, whether a corridor gets "
            "daylight, whether a facade can be cleaned without scaffolding.\n\n"
            "## Plan for maintenance, not just delivery\n\n"
            "A material that looks immaculate in a photograph may be impossible to "
            "maintain in a monsoon. Choosing for the second decade means preferring "
            "robust assemblies, repairable details and planting that will still be alive "
            "when the warranty has expired.\n\n"
            "## Leave room for change\n\n"
            "Tenants change, families grow, retail mixes shift. Floors that can be "
            "re-planned without moving structure hold their value; layouts that assume a "
            "single occupant do not.\n\n"
            "This article is demonstration content. It makes no claim about verified "
            "performance, certification or measured outcomes."
        ),
        "cover_image": f"{IMAGE_BASE}/insights/second-decade.jpg",
        "published_at": date(2026, 8, 12),
        "status": "published",
        "reading_minutes": 6,
        "author": "UrbanLedge Editorial",
    },
    {
        "slug": "reading-a-site-before-drawing-it",
        "title": "Reading a site before drawing it",
        "category": "Architecture",
        "excerpt": (
            "Demonstration article. What a week of looking at a site tells you that a "
            "survey drawing cannot."
        ),
        "content": (
            "Demonstration article content.\n\n"
            "Before the first sketch, the useful work is observation. Where does water "
            "go in the heaviest rain? Which way does the wind arrive in the evening? "
            "Which tree has been there longer than any of the neighbours?\n\n"
            "## Contours and habits\n\n"
            "A site is both a landform and a set of habits — the shortcut everyone uses, "
            "the corner where people already pause. Plans that acknowledge those habits "
            "feel inevitable; plans that ignore them need signage.\n\n"
            "## The test of a simple diagram\n\n"
            "If the idea cannot be drawn in a single line, it will be hard to explain and "
            "harder to deliver. Clarity early is not a compromise; it is the project's "
            "best protection.\n\n"
            "This article is demonstration content for layout purposes."
        ),
        "cover_image": f"{IMAGE_BASE}/insights/reading-a-site.jpg",
        "published_at": date(2026, 6, 3),
        "status": "published",
        "reading_minutes": 5,
        "author": "UrbanLedge Editorial",
    },
    {
        "slug": "mixed-use-without-the-compromise",
        "title": "Mixed use without the compromise",
        "category": "Property development",
        "excerpt": (
            "Demonstration article. Combining homes, workplaces and retail works when "
            "each use is planned as though it were alone."
        ),
        "content": (
            "Demonstration article content.\n\n"
            "Mixed use often fails politely: everything is provided, nothing is good. The "
            "usual cause is that the plan was drawn once and shared, rather than resolved "
            "separately for each use and then reconciled.\n\n"
            "## Separate front doors\n\n"
            "Residents, office workers and shoppers should not be forced through the same "
            "lobby. Distinct entries, distinct servicing and distinct lift cores cost "
            "floor area but buy decades of peaceful coexistence.\n\n"
            "## Services decide the plan\n\n"
            "Kitchen extract, refuse routes and deliveries are the real design problem. "
            "Solved early, they disappear; solved late, they define the building.\n\n"
            "This article is demonstration content."
        ),
        "cover_image": f"{IMAGE_BASE}/insights/mixed-use.jpg",
        "published_at": date(2026, 4, 21),
        "status": "published",
        "reading_minutes": 7,
        "author": "UrbanLedge Editorial",
    },
    {
        "slug": "what-landowners-ask-first",
        "title": "What landowners ask first",
        "category": "Market insights",
        "excerpt": (
            "Demonstration article. The first questions in a development conversation "
            "are rarely about design."
        ),
        "content": (
            "Demonstration article content.\n\n"
            "The first conversation with a landowner is about certainty: what can be "
            "built, what it will cost, how long it will take, and what could go wrong. "
            "Design answers all four, but only if it is asked to.\n\n"
            "## Sequence the unknowns\n\n"
            "Approvals, title, access and services carry more risk than the architecture. "
            "Naming them early is what makes a programme credible.\n\n"
            "## A brief that can be tested\n\n"
            "A development brief is useful when it can be priced and challenged — areas, "
            "unit mixes, parking and open space in numbers, not adjectives.\n\n"
            "This article is demonstration content and makes no market claims."
        ),
        "cover_image": f"{IMAGE_BASE}/insights/landowners.jpg",
        "published_at": date(2026, 2, 9),
        "status": "published",
        "reading_minutes": 5,
        "author": "UrbanLedge Editorial",
    },
    {
        "slug": "draft-walkable-neighbourhoods",
        "title": "Notes toward walkable neighbourhoods",
        "category": "Urban planning",
        "excerpt": "Demonstration draft article, kept unpublished to show editorial workflow.",
        "content": "Demonstration draft. Not published, so it is invisible to public visitors.",
        "cover_image": f"{IMAGE_BASE}/insights/walkable.jpg",
        "published_at": None,
        "status": "draft",
        "reading_minutes": 4,
        "author": "UrbanLedge Editorial",
    },
]

FAQS: list[dict] = [
    {
        "question": "What types of projects does UrbanLedge take on?",
        "answer": (
            "We work across residential, mixed-use, commercial, hospitality and urban "
            "development projects, and we advise on land and asset strategy. The "
            "projects shown on this website are demonstration content used to illustrate "
            "our scope."
        ),
        "display_order": 1,
    },
    {
        "question": "Do you work internationally?",
        "answer": (
            "Our illustrative project list spans several cities in Southeast Asia. We "
            "look at each opportunity on its own merits — the deciding factors are the "
            "place, the partners and whether the brief is one we can do well."
        ),
        "display_order": 2,
    },
    {
        "question": "How does the development process work?",
        "answer": (
            "We work in five stages: discover, plan, design, develop and deliver. Each "
            "stage ends with something you can review — an agreed brief, a tested "
            "options study, a resolved design or a delivery plan."
        ),
        "display_order": 3,
    },
    {
        "question": "What makes UrbanLedge different?",
        "answer": (
            "Design and delivery sit in the same team, so the reasoning behind a plan is "
            "still present when it is priced, approved and built. We would rather tell "
            "you early that something is difficult than discover it later."
        ),
        "display_order": 4,
    },
    {
        "question": "How do you incorporate sustainability?",
        "answer": (
            "Sustainability starts with orientation, daylight, ventilation, planting and "
            "water, because those decisions cost the least and last the longest. Where a "
            "project targets certification, the specific standard and its verification "
            "are agreed with you and the consultant team before any claim is made."
        ),
        "display_order": 5,
    },
    {
        "question": "Can you advise on land acquisition or site selection?",
        "answer": (
            "Yes. We can appraise a site for what it can reasonably hold, compare "
            "options and prepare a brief for partners. Our advice is commercial and "
            "design advice — legal, tax and investment decisions always need the "
            "appropriate professional advisers."
        ),
        "display_order": 6,
    },
]

GALLERY: list[dict] = [
    {
        "image": f"{IMAGE_BASE}/gallery/gallery-01.jpg",
        "title": "Riverside Quarter, promenade",
        "caption": "Demonstration image. Public promenade at the base of the residential towers.",
        "category": "residential",
        "project_slug": "riverside-quarter",
        "display_order": 1,
    },
    {
        "image": f"{IMAGE_BASE}/gallery/gallery-02.jpg",
        "title": "The Ledge, terraces",
        "caption": "Demonstration image. Outdoor rooms within the tower's structural frame.",
        "category": "commercial",
        "project_slug": "the-ledge",
        "display_order": 2,
    },
    {
        "image": f"{IMAGE_BASE}/gallery/gallery-03.jpg",
        "title": "Riverside Quarter, apartment interior",
        "caption": "Demonstration image. Living space opening to a deep balcony.",
        "category": "interiors",
        "project_slug": "riverside-quarter",
        "display_order": 3,
    },
    {
        "image": f"{IMAGE_BASE}/gallery/gallery-04.jpg",
        "title": "Northbank, structure plan",
        "caption": "Demonstration image. District structure diagram.",
        "category": "drawings",
        "project_slug": "northbank-masterplan",
        "display_order": 4,
    },
    {
        "image": f"{IMAGE_BASE}/gallery/gallery-05.jpg",
        "title": "Azure Heights, hillside",
        "caption": "Demonstration image. Residences stepping along the contour.",
        "category": "residential",
        "project_slug": "azure-heights",
        "display_order": 5,
    },
    {
        "image": f"{IMAGE_BASE}/gallery/gallery-06.jpg",
        "title": "Harbourline, courtyard",
        "caption": "Demonstration image. Shared planted courtyard between two workplaces.",
        "category": "commercial",
        "project_slug": "harbourline-offices",
        "display_order": 6,
    },
    {
        "image": f"{IMAGE_BASE}/gallery/gallery-07.jpg",
        "title": "Greenfield, shared court",
        "caption": "Demonstration image. Homes arranged around a planted courtyard.",
        "category": "masterplanning",
        "project_slug": "greenfield-residences",
        "display_order": 7,
    },
    {
        "image": f"{IMAGE_BASE}/gallery/gallery-08.jpg",
        "title": "Verdant Court, roof terrace",
        "caption": "Demonstration image. Private outdoor room above a townhouse.",
        "category": "residential",
        "project_slug": "verdant-court",
        "display_order": 8,
    },
    {
        "image": f"{IMAGE_BASE}/gallery/gallery-09.jpg",
        "title": "Straits Residences, garden deck",
        "caption": "Demonstration image. Shared deck between hotel and residences.",
        "category": "hospitality",
        "project_slug": "straits-hotel-residences",
        "display_order": 9,
    },
    {
        "image": f"{IMAGE_BASE}/gallery/gallery-10.jpg",
        "title": "Northbank, public realm",
        "caption": "Demonstration image. Blue-green drainage and open space framework.",
        "category": "masterplanning",
        "project_slug": "northbank-masterplan",
        "display_order": 10,
    },
    {
        "image": f"{IMAGE_BASE}/gallery/gallery-11.jpg",
        "title": "The Ledge, colonnade",
        "caption": "Demonstration image. Double-height public colonnade at street level.",
        "category": "commercial",
        "project_slug": "the-ledge",
        "display_order": 11,
    },
    {
        "image": f"{IMAGE_BASE}/gallery/gallery-12.jpg",
        "title": "Verdant Court, elevation study",
        "caption": "Demonstration image. Elevation study for the townhouse terraces.",
        "category": "drawings",
        "project_slug": "verdant-court",
        "display_order": 12,
    },
]

TEAM: list[dict] = [
    {
        "name": "Demo profile — Principal, Design",
        "role": "Design leadership",
        "note": "Demonstration profile. Replace with your own team before launch.",
    },
    {
        "name": "Demo profile — Principal, Development",
        "role": "Development delivery",
        "note": "Demonstration profile. Replace with your own team before launch.",
    },
    {
        "name": "Demo profile — Principal, Planning",
        "role": "Urban planning",
        "note": "Demonstration profile. Replace with your own team before launch.",
    },
]
