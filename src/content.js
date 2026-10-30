export const hotel = {
  name: 'St. Jacobs Hotel',
  address: 'Block 1, Plot 7A and B, Off Leonac Junction, Alagbaka GRA, Akure, Ondo State',
  phones: ['+2348104619664', '+2347012096322', '+2349059180573'],
  emails: ['reservation@saintjacobshotel.com', 'info@saintjacobshotel.com'],
};

export const navItems = [
  ['Home', '/'],
  ['Our Rooms', '/rooms/'],
  ['Blaze & Jacob', '/blaze-and-jacob/'],
  ['St. Jacobs Annex', '/annex/'],
  ['Facilities', '/facilities/'],
  ['About Us', '/about/'],
  ['Gallery', '/gallery/'],
  ['Contact Us', '/contact/'],
  ['Book a Room', '/booking/'],
];

export const rooms = [
  { slug:'standard-deluxe-annex', property:'annex', name:'Standard Deluxe', rate:50000, adults:2, children:1, size:'13.5m²', image:'/images/rooms/standard-deluxe-annex.jpg', description:'The Standard Deluxe Room offers guests a cozy, modern retreat designed for comfort and functionality. Covering 13.5 square meters, it provides the perfect balance between simplicity and style.' },
  { slug:'royal-deluxe-annex', property:'annex', name:'Royal Deluxe', rate:60000, adults:2, children:1, size:'19.6m²', image:'/images/rooms/royal-deluxe-annex.jpg', description:'The Royal Deluxe Room in St. Jacobs Annex offers generous space, stylish furnishings, and quiet luxury. With 19.6 square meters of comfort, it is designed for guests who appreciate extra space to relax and unwind.' },
  { slug:'executive-suite-annex', property:'annex', name:'Executive Suite', rate:70000, adults:3, children:1, size:'22.5m²', image:'/images/rooms/executive-suite-annex.jpg', description:'The Executive Suite at St. Jacobs Annex combines home-like comfort with refined hotel luxury. Designed for travelers who desire space and privacy, this 22.5-square-meter suite offers an inviting atmosphere filled with warmth and sophistication.' },
  { slug:'executive-deluxe', property:'main', name:'Executive Deluxe', rate:100000, adults:2, children:1, size:'20m²', image:'/images/rooms/executive-deluxe.jpg', description:'The Executive Deluxe Room is crafted for business travelers and guests who desire a serene, modern environment for rest and productivity. Spanning 20 square meters, it exudes subtle sophistication and practical comfort.' },
  { slug:'royal-superior', property:'main', name:'Royal Superior', rate:120000, adults:2, children:2, size:'22.9m²', image:'/images/rooms/royal-superior.jpg', description:'The Royal Superior Room captures the essence of comfort and modern elegance in a compact yet luxurious setting. Measuring 22.9 square meters, this room offers everything today’s traveler needs — comfort, style, and tranquility — in one refined space.' },
  { slug:'studio-room', property:'main', name:'Studio Room', rate:150000, adults:2, children:1, size:'20m²', image:'/images/rooms/studio-room.jpg', description:'The Royal Deluxe Room embodies contemporary comfort and royal charm. Spread across 20 square meters, it is designed for couples, corporate guests, or anyone who appreciates refined simplicity with a touch of class, with well-crafted furniture.' },
  { slug:'diplomatic-suite', property:'main', name:'Diplomatic Suite', rate:200000, adults:3, children:2, size:'40m²', image:'/images/rooms/diplomatic-suite.jpg', description:'The Diplomatic Suite provides the perfect balance between modern luxury and homely comfort. This 40-square-meter suite is designed for diplomats, business leaders, and discerning guests who appreciate a space that blends work, rest, and relaxation seamlessly.' },
  { slug:'presidential-suite', property:'main', name:'Presidential Suite', rate:500000, adults:4, children:3, size:'65.5m²', image:'/images/rooms/presidential-suite.jpg', description:'The Presidential Suite stands as the crown jewel of luxury and sophistication. Spanning an impressive 65.5 square meters, this exclusive suite redefines grandeur and comfort for elite guests who demand the very best in hospitality.' },
];

export const facilities = [
  { name:'Swimming pool', property:'Open-air courtyard', image:'/images/gallery/16-pool-courtyard.jpg', text:'An open-air pool courtyard with space to pause between plans. Confirm current access and hours with reservations.' },
  { name:'Gym', property:'Main hotel and annex room listings', image:'/images/gym.webp', text:'Gym access is listed among the amenities for the hotel’s published room categories. Opening hours have not been supplied.' },
  { name:'Restaurant', property:'Dining at St. Jacobs', image:'/images/gallery/07-restaurant.jpg', text:'A composed dining room for breakfast and meals during your stay. Confirm current service times with the hotel.' },
  { name:'Blaze & Jacob', property:'Lounge and bar', image:'/images/gallery/25-blaze-jacob-bar-wide.jpg', text:'A vivid lounge and bar within St. Jacobs Hotel, designed for relaxed evenings and time together.' },
  { name:'Hotel shop', property:'Everyday convenience', image:'/images/gallery/27-hotel-shop.jpg', text:'A convenient on-site retail space photographed with drinks, essentials and clothing.' },
];

export const galleryImages = [
  {src:'/images/gallery/01-standard-deluxe.jpg',category:'Rooms & Suites',alt:'Standard Deluxe bedroom with pale wood headboard and bedside lighting'},
  {src:'/images/gallery/02-deluxe-room.jpg',category:'Rooms & Suites',alt:'Hotel bedroom with warm curtains, work surface and tiled floor'},
  {src:'/images/gallery/03-breakfast-room.jpg',category:'Dining',alt:'Bright hotel breakfast room with white dining chairs'},
  {src:'/images/gallery/04-studio-room.jpg',category:'Rooms & Suites',alt:'Studio Room with black upholstered bed and red runner'},
  {src:'/images/gallery/05-executive-room.jpg',category:'Rooms & Suites',alt:'Executive bedroom with seating and a dark feature wall'},
  {src:'/images/gallery/06-suite-lounge.jpg',category:'Rooms & Suites',alt:'Suite sitting room with armchairs, sofa and coffee table'},
  {src:'/images/gallery/07-restaurant.jpg',category:'Dining',alt:'St. Jacobs restaurant prepared with white table linen'},
  {src:'/images/gallery/08-blaze-jacob-bar.jpg',category:'Blaze & Jacob',alt:'Blaze and Jacob bar with striped stools and warm gold lighting'},
  {src:'/images/gallery/09-deluxe-bed.jpg',category:'Rooms & Suites',alt:'Deluxe bedroom with black headboard and red accent cushion'},
  {src:'/images/gallery/10-blaze-jacob-lounge.jpg',category:'Blaze & Jacob',alt:'Blaze and Jacob lounge with colourful tufted seating'},
  {src:'/images/gallery/11-luxury-queen-vip.jpg',category:'Blaze & Jacob',alt:'VIP lounge corner with glass tables and striped chairs'},
  {src:'/images/gallery/12-presidential-suite.jpg',category:'Rooms & Suites',alt:'Presidential Suite with an ornate gold bed and classic furnishings'},
  {src:'/images/gallery/13-blaze-jacob-seating.jpg',category:'Blaze & Jacob',alt:'Blaze and Jacob seating area with deep green sofa and bright chairs'},
  {src:'/images/gallery/14-blaze-jacob-gold-lights.jpg',category:'Blaze & Jacob',alt:'Blaze and Jacob lounge beneath sculptural gold lights'},
  {src:'/images/gallery/15-blaze-jacob-sculpture.jpg',category:'Blaze & Jacob',alt:'Blaze and Jacob interior with wall sculpture and red chairs'},
  {src:'/images/gallery/16-pool-courtyard.jpg',category:'Pool',alt:'St. Jacobs pool courtyard viewed from above'},
  {src:'/images/gallery/17-diplomatic-suite.jpg',category:'Rooms & Suites',alt:'Diplomatic Suite bedroom opening into a separate sitting area'},
  {src:'/images/gallery/18-suite-sitting-room.jpg',category:'Rooms & Suites',alt:'Suite living room with sofa, armchair and adjoining bedroom'},
  {src:'/images/gallery/19-royal-superior.jpg',category:'Rooms & Suites',alt:'Royal Superior bedroom with red armchairs by the window'},
  {src:'/images/gallery/20-executive-deluxe.jpg',category:'Rooms & Suites',alt:'Executive Deluxe bedroom with television and work area'},
  {src:'/images/gallery/21-deluxe-workspace.jpg',category:'Rooms & Suites',alt:'Deluxe bedroom with a desk, chair and wall-mounted television'},
  {src:'/images/gallery/22-annex-courtyard.jpg',category:'Annex',alt:'St. Jacobs Annex courtyard and white exterior'},
  {src:'/images/gallery/23-deluxe-room-window.jpg',category:'Rooms & Suites',alt:'Deluxe bedroom with tall curtains and a reading chair'},
  {src:'/images/gallery/24-suite-bedroom-lounge.jpg',category:'Rooms & Suites',alt:'Spacious suite with bedroom and lounge seating'},
  {src:'/images/gallery/25-blaze-jacob-bar-wide.jpg',category:'Blaze & Jacob',alt:'Wide view of the Blaze and Jacob bar and lounge'},
  {src:'/images/gallery/26-blaze-jacob-art-wall.jpg',category:'Blaze & Jacob',alt:'Blaze and Jacob lounge with sculptural art wall and bar seating'},
  {src:'/images/gallery/27-hotel-shop.jpg',category:'Hotel Shop',alt:'Hotel shop with drinks, essentials and clothing displays'},
  {src:'/images/gallery/28-blaze-jacob-banquette.jpg',category:'Blaze & Jacob',alt:'Blaze and Jacob banquette seating with red and green chairs'},
  {src:'/images/gallery/29-royal-room.jpg',category:'Rooms & Suites',alt:'Royal bedroom with warm wood surround and reading chair'},
  {src:'/images/gallery/30-deluxe-room-dark.jpg',category:'Rooms & Suites',alt:'Dark-accented deluxe bedroom with red and navy bed runner'},
  {src:'/images/gallery/31-blaze-jacob-wine-wall.jpg',category:'Blaze & Jacob',alt:'Blaze and Jacob seating beneath gold lights and a glass bottle wall'},
  {src:'/images/gallery/32-suite-living-room.jpg',category:'Rooms & Suites',alt:'Suite living room with sofa and a view into the bedroom'},
  {src:'/images/gallery/33-studio-room-wide.jpg',category:'Rooms & Suites',alt:'Wide view of a studio bedroom with work desk and armchairs'},
  {src:'/images/gallery/34-presidential-suite-wide.jpg',category:'Rooms & Suites',alt:'Wide view of the Presidential Suite and ornate gold bed'},
];

export const currency = new Intl.NumberFormat('en-NG', { style:'currency', currency:'NGN', maximumFractionDigits:0 });
export const roomBySlug = (slug) => rooms.find((room) => room.slug === (slug === 'royal-deluxe' ? 'studio-room' : slug));
