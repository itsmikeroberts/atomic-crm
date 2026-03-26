# Mobile Gigs Implementation Plan

## Overview

This plan outlines the steps to add gigs (deals) functionality to the mobile version of Atomic CRM. Currently, the mobile app only includes contacts, notes, and tasks. This implementation will add a simplified, mobile-optimized gig management interface suitable for band members on the go.

## Current Mobile Architecture Analysis

### Existing Mobile Components

1. **Layout Components**
   - [`MobileLayout.tsx`](src/components/atomic-crm/layout/MobileLayout.tsx:10) - Main layout wrapper
   - [`MobileHeader.tsx`](src/components/atomic-crm/layout/MobileHeader.tsx:1) - Fixed header component
   - [`MobileContent.tsx`](src/components/atomic-crm/layout/MobileContent.tsx:3) - Scrollable content area
   - [`MobileNavigation.tsx`](src/components/atomic-crm/layout/MobileNavigation.tsx:31) - Bottom navigation bar

2. **Mobile Resources** (in [`CRM.tsx`](src/components/atomic-crm/root/CRM.tsx:271))
   - Contacts: [`ContactListMobile`](src/components/atomic-crm/contacts/ContactList.tsx:81) + [`ContactShow`](src/components/atomic-crm/contacts/ContactShow.tsx:30)
   - Tasks: [`MobileTasksList`](src/components/atomic-crm/tasks/MobileTasksList.tsx:5)
   - Companies: [`CompanyShow`](src/components/atomic-crm/companies/CompanyShow.tsx:43) (show only)

3. **Mobile Patterns**
   - Infinite scroll lists with [`InfinitePagination`](src/components/atomic-crm/misc/InfinitePagination.tsx)
   - Sheet-based create/edit forms (e.g., [`ContactCreateSheet`](src/components/atomic-crm/contacts/ContactCreateSheet.tsx))
   - Mobile-specific show pages with [`MobileHeader`](src/components/atomic-crm/layout/MobileHeader.tsx:1) + [`MobileContent`](src/components/atomic-crm/layout/MobileContent.tsx:3)
   - Responsive filters using [`ResponsiveFilters`](src/components/atomic-crm/misc/ResponsiveFilters.tsx) (sheet on mobile)

4. **Navigation Structure**
   - Bottom nav with 5 slots: Home, Contacts, Create (+), Tasks, Settings
   - Currently no gigs navigation button

## Design Decisions

### Mobile-First Simplifications

Given the mobile context, we'll focus on:

1. **Read-Only Gig Details** - View upcoming gigs, performance details, venue info
2. **Quick Actions** - Mark gig as confirmed, view set lists, contact venue
3. **Simplified List View** - Card-based list showing essential gig info
4. **No Complex Editing** - Create/edit gigs on desktop; mobile is for viewing and quick updates
5. **No Kanban Board** - Linear list view only (Kanban requires desktop)

### What to Include

**Essential Features:**
- ✅ Gig list (upcoming and past)
- ✅ Gig detail view (performance date, venue, fee, notes)
- ✅ Venue information display
- ✅ Set list viewing (read-only)
- ✅ Band member assignments
- ✅ Quick status updates (confirm attendance)
- ✅ Contact information (venue contact, company contact)

**Excluded from Mobile (Desktop Only):**
- ❌ Gig creation/editing (too complex for mobile)
- ❌ Kanban board
- ❌ Quote/invoice generation
- ❌ Set list editing (drag-and-drop not mobile-friendly)
- ❌ Venue creation/editing

## Implementation Phases

### Phase 1: Mobile Gig List Component

**Files to Create:**
- `src/components/atomic-crm/deals/MobileGigsList.tsx` - Main list component
- `src/components/atomic-crm/deals/MobileGigCard.tsx` - Individual gig card
- `src/components/atomic-crm/deals/MobileGigListFilter.tsx` - Mobile-optimized filters

**Implementation Details:**

```typescript
// MobileGigsList.tsx structure
export const MobileGigsList = () => {
  return (
    <>
      <MobileHeader>
        <h1 className="text-xl font-semibold">Gigs</h1>
        <MobileGigListFilter />
      </MobileHeader>
      <MobileContent>
        <InfiniteListBase
          resource="deals"
          filter={{ archived_at: null }}
          sort={{ field: "performance_date", order: "ASC" }}
          perPage={20}
        >
          <MobileGigListContent />
        </InfiniteListBase>
      </MobileContent>
    </>
  );
};
```

**Card Design:**
```typescript
// MobileGigCard.tsx - Display format
interface GigCardProps {
  gig: Gig;
}

// Card shows:
// - Performance date (large, prominent)
// - Gig name
// - Venue name + city
// - Time (start - end)
// - Fee amount
// - Status badge (Enquiry, Quoted, Confirmed, etc.)
// - Tap to view details
```

**Filters:**
- Status (All, Upcoming, Past, Confirmed)
- Date range (This Week, This Month, Next 3 Months)
- Venue (autocomplete)

### Phase 2: Mobile Gig Show Page

**Files to Create:**
- `src/components/atomic-crm/deals/MobileGigShow.tsx` - Mobile gig detail view

**Implementation Details:**

```typescript
// MobileGigShow.tsx structure
export const MobileGigShow = () => {
  const isMobile = useIsMobile();
  
  return (
    <ShowBase>
      {isMobile ? <MobileGigShowContent /> : <DealShow />}
    </ShowBase>
  );
};

const MobileGigShowContent = () => {
  const { record } = useShowContext<Gig>();
  
  return (
    <>
      <MobileHeader>
        <MobileBackButton to="/gigs" />
        <h1 className="text-xl font-semibold truncate">{record.name}</h1>
      </MobileHeader>
      <MobileContent>
        {/* Sections */}
        <PerformanceDetailsSection />
        <VenueSection />
        <BandMembersSection />
        <SetListSection />
        <NotesSection />
        <ContactsSection />
      </MobileContent>
    </>
  );
};
```

**Sections to Display:**

1. **Performance Details**
   - Date & time (prominent display)
   - Status badge
   - Fee & deposit info
   - Set count

2. **Venue Information**
   - Venue name (link to venue details if needed)
   - Address
   - City
   - Capacity
   - Load-in notes (collapsible)

3. **Band Members**
   - List of assigned members
   - Roles
   - Confirmation status
   - Quick "Confirm Attendance" button for current user

4. **Set Lists** (Read-Only)
   - Expandable sections per set
   - Song list with durations
   - Total set time

5. **Notes**
   - Gig-specific notes
   - Add note button (opens sheet)

6. **Contacts**
   - Company contact
   - Venue contact (if available)
   - Quick call/email buttons

### Phase 3: Navigation Integration

**Files to Modify:**
- `src/components/atomic-crm/layout/MobileNavigation.tsx`
- `src/components/atomic-crm/root/CRM.tsx`

**Changes:**

1. **Update Bottom Navigation** (MobileNavigation.tsx)
   - Replace "Home" with "Gigs" or add 6th button
   - Option A: Home, Contacts, Create, Gigs, Tasks, Settings (6 buttons)
   - Option B: Gigs, Contacts, Create, Tasks, Settings (5 buttons, remove Home)
   - **Recommended: Option B** - Gigs become the primary view for band members

```typescript
// MobileNavigation.tsx changes
export const MobileNavigation = () => {
  // Add gigs path matching
  if (matchPath("/gigs/*", location.pathname)) {
    currentPath = "/gigs";
  }
  
  return (
    <nav>
      <NavigationButton
        href="/gigs"
        Icon={Calendar} // or Music icon
        label="Gigs"
        isActive={currentPath === "/gigs"}
      />
      <NavigationButton href="/contacts" ... />
      <CreateButton />
      <NavigationButton href="/tasks" ... />
      <SettingsButton />
    </nav>
  );
};
```

2. **Register Gig Resource** (CRM.tsx)

```typescript
// In MobileAdmin component
<Resource
  name="deals"
  list={MobileGigsList}
  show={MobileGigShow}
  recordRepresentation={(record) => record.name}
/>
```

3. **Update Create Button**
   - Add "Gig" option to create dropdown (optional)
   - Or keep gig creation desktop-only

### Phase 4: Quick Actions & Interactions

**Files to Create:**
- `src/components/atomic-crm/deals/MobileGigActions.tsx` - Action buttons
- `src/components/atomic-crm/deals/ConfirmAttendanceButton.tsx` - Quick confirm

**Implementation:**

1. **Confirm Attendance Button**
   - Shows on gig detail page
   - Updates current user's gig_member record
   - Optimistic UI update

```typescript
export const ConfirmAttendanceButton = () => {
  const record = useRecordContext<Gig>();
  const { identity } = useGetIdentity();
  const dataProvider = useDataProvider();
  const notify = useNotify();
  
  const handleConfirm = async () => {
    // Find or create gig_member record
    // Update confirmed status
    // Show success notification
  };
  
  return (
    <Button onClick={handleConfirm}>
      Confirm Attendance
    </Button>
  );
};
```

2. **Quick Contact Actions**
   - Call venue button (tel: link)
   - Email company contact (mailto: link)
   - Get directions to venue (maps link)

3. **Share Gig Details**
   - Native share API for gig details
   - Copy gig info to clipboard

### Phase 5: Offline Support & PWA Enhancements

**Implementation:**

1. **Cache Gig Data**
   - Already using PersistQueryClientProvider in mobile
   - Ensure gig queries are cached
   - Add stale-while-revalidate strategy

2. **Optimistic Updates**
   - Attendance confirmation
   - Note creation
   - Status updates

3. **Sync Indicators**
   - Show when data is stale
   - Pull-to-refresh support

### Phase 6: Mobile Dashboard Integration

**Files to Modify:**
- `src/components/atomic-crm/dashboard/MobileDashboard.tsx`

**Changes:**

Add "Upcoming Gigs" widget to mobile dashboard:
- Next 3 gigs
- Quick view of dates and venues
- Tap to view details

```typescript
// Add to MobileDashboard.tsx
export const MobileDashboard = () => {
  return (
    <MobileLayoutWrapper>
      <Welcome />
      <UpcomingGigsWidget /> {/* NEW */}
      <DashboardActivityLog />
      <DashboardStepper />
    </MobileLayoutWrapper>
  );
};
```

## File Structure Summary

```
src/components/atomic-crm/deals/
├── index.ts (update exports)
├── DealList.tsx (existing desktop)
├── DealShow.tsx (existing desktop)
├── MobileGigsList.tsx (NEW)
├── MobileGigListContent.tsx (NEW)
├── MobileGigCard.tsx (NEW)
├── MobileGigListFilter.tsx (NEW)
├── MobileGigShow.tsx (NEW)
├── MobileGigActions.tsx (NEW)
└── ConfirmAttendanceButton.tsx (NEW)

src/components/atomic-crm/dashboard/
├── MobileDashboard.tsx (modify)
└── UpcomingGigsWidget.tsx (NEW)

src/components/atomic-crm/layout/
└── MobileNavigation.tsx (modify)

src/components/atomic-crm/root/
└── CRM.tsx (modify)
```

## Testing Checklist

### Functional Testing
- [ ] Gig list loads with correct data
- [ ] Filters work correctly
- [ ] Infinite scroll pagination works
- [ ] Gig detail page displays all sections
- [ ] Navigation between gigs and other resources works
- [ ] Confirm attendance button updates status
- [ ] Contact actions (call, email) work
- [ ] Notes can be added to gigs
- [ ] Set lists display correctly (read-only)
- [ ] Venue information displays correctly

### Responsive Testing
- [ ] Works on iPhone (various sizes)
- [ ] Works on Android (various sizes)
- [ ] Works on tablets
- [ ] Bottom navigation doesn't overlap content
- [ ] Headers are fixed and scrollable content works
- [ ] Touch targets are appropriately sized (min 44x44px)

### Performance Testing
- [ ] List scrolling is smooth
- [ ] Images/avatars load efficiently
- [ ] No layout shifts during load
- [ ] Offline mode works
- [ ] Data persists between sessions

### PWA Testing
- [ ] Works in standalone mode (iOS)
- [ ] Works in standalone mode (Android)
- [ ] Bottom navigation accounts for safe areas
- [ ] Pull-to-refresh works

## Migration Notes

### Data Considerations

1. **Existing Gigs** - All existing deals will be visible in mobile
2. **Permissions** - Use existing RLS policies (no changes needed)
3. **Relationships** - Leverage existing views (deals_summary)

### Backward Compatibility

- Desktop functionality remains unchanged
- Mobile and desktop share the same data
- No database migrations required
- Existing deals/gigs work in both interfaces

## Future Enhancements (Post-MVP)

1. **Calendar View** - Month/week view of gigs
2. **Gig Creation** - Simplified mobile gig creation form
3. **Set List Editing** - Mobile-friendly set list builder
4. **Push Notifications** - Reminders for upcoming gigs
5. **Check-in Feature** - Location-based gig check-in
6. **Expense Tracking** - Add travel expenses on mobile
7. **Photo Upload** - Add gig photos from mobile
8. **Availability Management** - Mark availability for gig dates

## Implementation Timeline

**Estimated Effort:** 3-4 days

- **Phase 1** (List View): 1 day
- **Phase 2** (Detail View): 1 day
- **Phase 3** (Navigation): 0.5 days
- **Phase 4** (Quick Actions): 0.5 days
- **Phase 5** (Offline/PWA): 0.5 days
- **Phase 6** (Dashboard): 0.5 days
- **Testing & Polish**: 0.5 days

## Success Metrics

1. **Adoption** - % of band members using mobile gig view
2. **Engagement** - Frequency of gig detail views
3. **Actions** - Number of attendance confirmations via mobile
4. **Performance** - Page load times < 2s on 3G
5. **Satisfaction** - User feedback on mobile gig experience

## Dependencies

### Required Components (Already Exist)
- ✅ MobileLayout, MobileHeader, MobileContent
- ✅ InfiniteListBase and InfinitePagination
- ✅ ResponsiveFilters
- ✅ Sheet components for actions
- ✅ useIsMobile hook

### Required Data (Already Exist)
- ✅ deals table with gig fields
- ✅ deals_summary view
- ✅ venues table
- ✅ gig_members table
- ✅ set_lists and set_list_songs tables

### Icons Needed
- Calendar (for navigation)
- MapPin (for venue)
- Users (for band members)
- Music (for set lists)
- Phone, Mail (for contacts)

## Conclusion

This plan provides a comprehensive roadmap for adding gig functionality to the mobile version of Atomic CRM. The implementation focuses on read-heavy operations suitable for mobile use cases, while keeping complex editing operations on desktop. The phased approach allows for incremental delivery and testing.

The mobile gig interface will enable band members to:
- Quickly check upcoming gigs
- View performance details and venue information
- Confirm their attendance
- Access set lists on the go
- Contact venues and companies directly
- Stay informed about gig status changes

This enhancement will make the mobile app significantly more useful for band members who need gig information while traveling or at venues.
