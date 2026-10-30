# Room inventory confirmation

The live booking database currently uses a conservative inventory of **1 room per category**. This prevents accidental overbooking while the hotel confirms its actual sellable inventory.

Public listings are not reliable enough to update production automatically:

- Hotels.ng states that the hotel has 44 rooms: 25 Executive Deluxe, 4 Royal Deluxe, 10 Royal Superior, 4 Diplomatic Suite and 1 Presidential Suite.
- Hotels.com states that the property has 45 rooms.
- Neither listing clearly maps the newer Annex categories or the current Studio Room category.

The hotel owner or reservations manager should complete the **Confirmed inventory** column below. Use the number of rooms that can actually be sold online in each category, excluding permanently unavailable or staff-use rooms.

| Property | Website category | Current safe inventory | Confirmed inventory |
| --- | --- | ---: | ---: |
| Annex Building | Standard Deluxe | 1 | |
| Annex Building | Royal Deluxe | 1 | |
| Annex Building | Executive Suite | 1 | |
| Main Building | Executive Deluxe | 1 | |
| Main Building | Royal Superior | 1 | |
| Main Building | Studio Room | 1 | |
| Main Building | Diplomatic Suite | 1 | |
| Main Building | Presidential Suite | 1 | |

After confirmation, replace the numbers in the following statements and run them once in the Supabase SQL Editor:

```sql
update public.room_types set inventory = 1 where slug = 'standard-deluxe-annex';
update public.room_types set inventory = 1 where slug = 'royal-deluxe-annex';
update public.room_types set inventory = 1 where slug = 'executive-suite-annex';
update public.room_types set inventory = 1 where slug = 'executive-deluxe';
update public.room_types set inventory = 1 where slug = 'royal-superior';
update public.room_types set inventory = 1 where slug = 'studio-room';
update public.room_types set inventory = 1 where slug = 'diplomatic-suite';
update public.room_types set inventory = 1 where slug = 'presidential-suite';
```

Source checks performed on 29 October 2026:

- https://hotels.ng/hotel/1438101-st-jacobs-hotel
- https://www.hotels.com/ho2854281888/st-jacobs-hotel-akure-nigeria/

