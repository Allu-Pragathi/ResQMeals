export const impactMetrics = [
  { label: 'Total Donations', value: '12,450', change: '+8% vs last month' },
  { label: 'People Fed', value: '520k', change: '+3.2% vs last month' },
  { label: 'Active NGOs', value: '128', change: 'Across 14 regions' },
]

export const howItWorksSteps = [
  {
    title: 'Share surplus food',
    description: 'Donors submit food details, quantity, and safe pickup window.',
  },
  {
    title: 'Smart NGO matching',
    description: 'Platform prioritizes nearby NGOs/volunteers (ML scoring planned).',
  },
  {
    title: 'Pickup & tracking',
    description: 'NGOs accept, pick up, and update statuses in real time.',
  },
  {
    title: 'Impact reporting',
    description: 'Dashboards show donations, people fed, and pickup success.',
  },
]

export const testimonials = [
  {
    name: 'FoodBridge Foundation',
    role: 'NGO Partner',
    quote:
      'ResQMeals has streamlined our pickups. Volunteers know exactly where to go and when.',
  },
  {
    name: 'Chef Anita Rao',
    role: 'Restaurant Donor',
    quote:
      'Scheduling end-of-day pickups is simple. Knowing food reaches families safely is priceless.',
  },
  {
    name: 'CityServe',
    role: 'Admin Partner',
    quote:
      'The dashboard highlights bottlenecks and helps us route NGOs where they are needed most.',
  },
]

export const donationStatusSummary = [
  { label: 'Pending', count: 6, color: 'bg-amber-100 text-amber-800' },
  { label: 'Accepted', count: 9, color: 'bg-blue-100 text-blue-800' },
  { label: 'Picked', count: 5, color: 'bg-purple-100 text-purple-800' },
  { label: 'Delivered', count: 18, color: 'bg-emerald-100 text-emerald-800' },
]

export const donorDonations = [
  {
    id: 'DN-2451',
    foodType: 'Vegetable curries & rice',
    quantity: '40 servings',
    expiry: 'Pickup within 4 hrs',
    location: 'Downtown Kitchen, Block C',
    status: 'Pending',
  },
  {
    id: 'DN-2450',
    foodType: 'Sandwich trays',
    quantity: '25 trays',
    expiry: 'Pickup within 3 hrs',
    location: 'Skyline Hotel',
    status: 'Accepted',
  },
  {
    id: 'DN-2449',
    foodType: 'Fresh produce boxes',
    quantity: '60 kg',
    expiry: 'Pickup today',
    location: 'Green Market',
    status: 'Picked',
  },
]

export const ngoRequests = [
  {
    id: 'RQ-8831',
    donor: 'Skyline Hotel',
    foodType: 'Sandwich trays',
    quantity: '25 trays',
    distance: '2.4 km',
    priority: 'High',
    status: 'Awaiting response',
    pickup: 'Today, 6:30 PM',
  },
  {
    id: 'RQ-8828',
    donor: 'Community Kitchen',
    foodType: 'Rice & lentils',
    quantity: '80 servings',
    distance: '4.1 km',
    priority: 'Medium',
    status: 'In discussion',
    pickup: 'Today, 7:00 PM',
  },
  {
    id: 'RQ-8822',
    donor: 'Garden Market',
    foodType: 'Fresh veggies',
    quantity: '55 kg',
    distance: '3.8 km',
    priority: 'Low',
    status: 'Awaiting response',
    pickup: 'Tomorrow, 9:00 AM',
  },
]

export const statusTracking = [
  {
    label: 'Awaiting pickup',
    detail: '3 requests need volunteers',
  },
  {
    label: 'In transit',
    detail: '2 pickups en route with cold-chain ensured',
  },
  {
    label: 'Delivered',
    detail: '18 deliveries confirmed today',
  },
]

export const kpiCards = [
  { label: 'Total donations', value: '12,450', trend: '+8.1%' },
  { label: 'Estimated people fed', value: '520,300', trend: '+3.2%' },
  { label: 'Pickup success rate', value: '94.6%', trend: '+1.4%' },
]

export const donationsPerDay = [
  { day: 'Mon', donations: 35, peopleFed: 820 },
  { day: 'Tue', donations: 42, peopleFed: 940 },
  { day: 'Wed', donations: 30, peopleFed: 760 },
  { day: 'Thu', donations: 48, peopleFed: 1010 },
  { day: 'Fri', donations: 55, peopleFed: 1200 },
  { day: 'Sat', donations: 62, peopleFed: 1410 },
  { day: 'Sun', donations: 40, peopleFed: 930 },
]

export const ngoContribution = [
  { ngo: 'FoodBridge', donations: 420 },
  { ngo: 'HopeAid', donations: 360 },
  { ngo: 'ServeNow', donations: 295 },
  { ngo: 'ReliefLine', donations: 240 },
]

export const foodTypeDistribution = [
  { name: 'Cooked meals', value: 38 },
  { name: 'Produce', value: 26 },
  { name: 'Bakery', value: 14 },
  { name: 'Dairy', value: 12 },
  { name: 'Dry goods', value: 10 },
]

export const recentDonations = [
  {
    id: 'DN-2451',
    donor: 'Downtown Kitchen',
    ngo: 'FoodBridge',
    items: '40 meals',
    status: 'Pending',
    time: '16 mins ago',
  },
  {
    id: 'DN-2450',
    donor: 'Skyline Hotel',
    ngo: 'HopeAid',
    items: '25 trays',
    status: 'Accepted',
    time: '35 mins ago',
  },
  {
    id: 'DN-2449',
    donor: 'Green Market',
    ngo: 'ServeNow',
    items: '60 kg produce',
    status: 'Picked',
    time: '1 hr ago',
  },
  {
    id: 'DN-2448',
    donor: 'City Events',
    ngo: 'ReliefLine',
    items: '120 meals',
    status: 'Delivered',
    time: '2 hrs ago',
  },
]

export const volunteerRequests = [
  {
    id: 'T-101',
    type: 'Pickup & Delivery',
    from: 'Fresh Bakery, 2nd St',
    to: 'Hope Shelter, Main Road',
    distance: '1.2 km',
    items: '20 Boxes of Bread',
    urgent: true,
    points: 50,
    status: 'Open'
  },
  {
    id: 'T-102',
    type: 'Quality Check',
    from: 'Community Garden',
    to: 'N/A',
    distance: '0.8 km',
    items: 'Fresh Vegetables',
    urgent: false,
    points: 30,
    status: 'Open'
  },
  {
    id: 'T-103',
    type: 'Pickup & Delivery',
    from: 'Wedding Hall A',
    to: 'City Orphanage',
    distance: '3.5 km',
    items: '50 Meals',
    urgent: true,
    points: 100,
    status: 'Assigned'
  }
]
