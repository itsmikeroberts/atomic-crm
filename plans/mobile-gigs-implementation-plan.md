# Mobile Gigs Implementation Plan (Simplified)

## Overview

This plan outlines the steps to add gigs (deals) functionality to the mobile version of Atomic CRM. Currently, the mobile app only includes contacts, notes, and tasks.

**Key Insight:** The desktop deals UI can be largely reused for mobile with minimal mobile-specific adaptations. We'll follow the same pattern used by [`ContactShow`](src/components/atomic-crm/contacts/ContactShow.tsx:30) and [`CompanyShow`](src/components/atomic-crm/companies/CompanyShow.tsx:43), which use `useIsMobile()` to conditionally render mobile vs desktop layouts.

## Current Mobile Architecture Analysis

### Existing Mobile Components

1. **Layout Components**
   - [`MobileLayout.tsx`](src/components/atomic-crm/layout/MobileLayout.tsx:10) - Main layout wrapper
   - [`MobileHeader.tsx`](src/components/atomic-crm/layout/MobileHeader.tsx:1) - Fixed header component
   - [`MobileContent.tsx`](src/components/atomic-crm/layout/MobileContent.tsx:3) - Scrollable content area
   - [`MobileNavigation.tsx`](src/components/atomic-crm/layout/MobileNavigation.tsx:31) - Bottom navigation bar

2. **Mobile Resources** (in [`CRM.tsx`](src/components/atomic-crm/root/CRM.tsx:271))
   - Contacts: [`ContactListMobile`](src/components/atomic-crm/contacts/ContactList.tsx:81) + [`ContactShow`](src/components/atomic-crm/contacts/ContactShow.tsx:30) (uses `useIsMobile()`)
   - Tasks: [`MobileTasksList`](src/components/atomic-crm/tasks/MobileTasksList.tsx:5)
   - Companies: [`CompanyShow`](src/components/atomic-crm/companies/CompanyShow.tsx:43) (show only, uses `useIsMobile()`)

3. **Existing Desktop Deals Components**
   - [`DealList.tsx`](src/components/atomic-crm/deals/DealList.tsx:22) - Kanban board with drag-and-drop
   - [`DealListContent.tsx`](src/components/atomic-crm/deals/DealListContent.tsx:12) - Kanban columns
   - [`DealShow.tsx`](src/components/atomic-crm/deals/DealShow.tsx:36) - Dialog-based detail view
   - All deal components already exist and work well

4. **Mobile Patterns**
   - Infinite scroll lists with [`InfinitePagination`](src/components/atomic-crm/misc/InfinitePagination.tsx)
   - Sheet-based create/edit forms (e.g., [`ContactCreateSheet`](src/components/atomic-crm/contacts/ContactCreateSheet.tsx))
   - Mobile-specific show pages with [`MobileHeader`](src/components/atomic-crm/layout/MobileHeader.tsx:1) + [`MobileContent`](src/components/atomic-crm/layout/MobileContent.tsx:3)
   - Responsive filters using [`ResponsiveFilters`](src/components/atomic-crm/misc/ResponsiveFilters.tsx) (sheet on mobile)

5. **Navigation Structure**
   - Bottom nav with 5 slots: Home, Contacts, Create (+), Tasks, Settings
   - Currently no gigs navigation button

## Design Decisions

### Reuse Desktop UI with Mobile Adaptations

**Key Decision:** Instead of creating entirely new mobile components, we'll:

1. **Reuse [`DealShow`](src/components/atomic-crm/deals/DealShow.tsx:36)** - Already works as a dialog, can be adapted for mobile full-screen
2. **Create Simple Mobile List** - Card-based list (Kanban board doesn't work on mobile)
3. **Follow Existing Patterns** - Use same `useIsMobile()` pattern as contacts and companies

### What Changes for Mobile

**Mobile Adaptations:**
- ✅ Replace Kanban board with simple card list
- ✅ Adapt [`DealShow`](src/components/atomic-crm/deals/DealShow.tsx:36) to use [`MobileHeader`](src/components/atomic-crm/layout/MobileHeader.tsx:1) + [`MobileContent`](src/components/atomic-crm/layout/MobileContent.tsx:3) on mobile
- ✅ Simplify filters for mobile (sheet-based)
- ✅ Keep all existing functionality (view details, notes, set lists, etc.)

**What Works on Mobile (Reused from Desktop):**
- ✅ Gig detail view (all sections from [`DealShow`](src/components/atomic-crm/deals/DealShow.tsx:36))
- ✅ Venue information display
- ✅ Set list viewing
- ✅ Band member assignments
- ✅ Notes (already mobile-friendly)
- ✅ Contact information

**Mobile-Only Limitations:**
- ❌ No Kanban board (replaced with list)
- ❌ No gig creation/editing (desktop only for now)
- ❌ No drag-and-drop operations

## Implementation Phases

### Phase 1: Create Mobile Gig List Component

**Files to Create:**
- `src/components/atomic-crm/deals/GigListMobile.tsx` - Mobile list component

**Implementation Details:**

```typescript
// GigListMobile.tsx - Simple card-based list
export const GigListMobile = () => {
  return (
    <>
      <MobileHeader>
        <h1 className="text-xl font-semibold">Gigs</h1>
      </MobileHeader>
      <MobileContent>
        <InfiniteListBase
          resource="deals"
          filter={{ "archived_at@is": null }}
          sort={{ field: "performance_date", order: "ASC" }}
          perPage={20}
        >
          <GigListContentMobile />
        </InfiniteListBase>
      </MobileContent>
    </>
  );
};

// Similar to ContactListContentMobile pattern
export const GigListContentMobile = () => {
  const { data, isPending } = useListContext<Gig>();
  
  if (isPending) return <SimpleListLoading />;
  if (!data?.length) return <ListNoResults />;
  
  return (
    <div className="space-y-3">
      {data.map((gig) => (
        <Link key={gig.id} to={`/deals/${gig.id}/show`}>
          <Card>
            <CardContent className="p-4">
              {/* Performance date */}
              {/* Gig name */}
              {/* Venue + city */}
              {/* Status badge */}
            </CardContent>
          </Card>
        </Link>
      ))}
      <InfinitePagination />
    </div>
  );
};
```

**Estimated Effort:** 2-3 hours

### Phase 2: Adapt DealShow for Mobile

**Files to Modify:**
- `src/components/atomic-crm/deals/DealShow.tsx` - Add mobile layout

**Implementation Details:**

```typescript
// Modify DealShow.tsx to support mobile
export const DealShow = ({ open, id }: { open: boolean; id?: string }) => {
  const isMobile = useIsMobile();
  const redirect = useRedirect();
  
  // On mobile, don't use Dialog - render full screen
  if (isMobile) {
    return id ? (
      <ShowBase id={id}>
        <DealShowContentMobile />
      </ShowBase>
    ) : null;
  }
  
  // Desktop: existing Dialog implementation
  const handleClose = () => redirect("list", "deals");
  return (
    <Dialog open={open} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="lg:max-w-4xl p-4 overflow-y-auto max-h-9/10 top-1/20 translate-y-0">
        {id ? (
          <ShowBase id={id}>
            <DealShowContent />
          </ShowBase>
        ) : null}
      </DialogContent>
    </Dialog>
  );
};

// Add mobile version
const DealShowContentMobile = () => {
  const record = useRecordContext<Gig>();
  if (!record) return null;
  
  return (
    <>
      <MobileHeader>
        <MobileBackButton to="/deals" />
        <h1 className="text-xl font-semibold truncate">{record.name}</h1>
      </MobileHeader>
      <MobileContent>
        {/* Reuse all existing sections from DealShowContent */}
        <DealShowContent />
      </MobileContent>
    </>
  );
};
```

**Estimated Effort:** 2-3 hours

### Phase 3: Register Deals Resource & Navigation

**Files to Modify:**
- `src/components/atomic-crm/layout/MobileNavigation.tsx`
- `src/components/atomic-crm/root/CRM.tsx`

**Changes:**

1. **Update Bottom Navigation** ([`MobileNavigation.tsx`](src/components/atomic-crm/layout/MobileNavigation.tsx:31))

```typescript
// Add deals/gigs path matching (around line 43)
if (matchPath("/deals/*", location.pathname)) {
  currentPath = "/deals";
}

// Add navigation button (replace Home or add as 6th button)
<NavigationButton
  href="/deals"
  Icon={Calendar} // from lucide-react
  label="Gigs"
  isActive={currentPath === "/deals"}
/>
```

2. **Register Deals Resource** ([`CRM.tsx`](src/components/atomic-crm/root/CRM.tsx:271))

```typescript
// In MobileAdmin component (around line 320)
<Resource
  name="deals"
  list={GigListMobile}
  show={DealShow}
  recordRepresentation={(record) => record.name}
/>
```

**Estimated Effort:** 1-2 hours

## File Structure Summary

**New Files (2):**
```
src/components/atomic-crm/deals/
├── GigListMobile.tsx (NEW - mobile list view)
└── index.ts (modify - export GigListMobile)
```

**Modified Files (3):**
```
src/components/atomic-crm/deals/
└── DealShow.tsx (modify - add mobile layout support)

src/components/atomic-crm/layout/
└── MobileNavigation.tsx (modify - add gigs button)

src/components/atomic-crm/root/
└── CRM.tsx (modify - register deals resource)
```

**Total:** 2 new files, 3 modified files (vs 9 new files in original plan)

## Testing Checklist

### Functional Testing
- [ ] Gig list loads and displays correctly on mobile
- [ ] Infinite scroll pagination works
- [ ] Tapping a gig opens detail view
- [ ] Gig detail page displays all sections (reused from desktop)
- [ ] Navigation between gigs and other resources works
- [ ] Back button returns to gig list
- [ ] All existing desktop features work (notes, set lists, venue info)

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

## Migration & Compatibility Notes

### No Database Changes Required
- All existing deals/gigs work immediately
- Uses existing `deals` table and `deals_summary` view
- Existing RLS policies apply

### Desktop Unchanged
- Desktop Kanban board continues to work
- [`DealShow`](src/components/atomic-crm/deals/DealShow.tsx:36) Dialog works on desktop
- Mobile and desktop share same data and components

## Implementation Timeline

**Estimated Effort:** 0.5-1 day (much simpler than original plan!)

- **Phase 1** (Mobile List): 2-3 hours
- **Phase 2** (Adapt DealShow): 2-3 hours
- **Phase 3** (Navigation): 1-2 hours
- **Testing & Polish**: 1-2 hours

**Total: 6-10 hours** vs original 3-4 days

## Future Enhancements (Post-MVP)

1. **Mobile Filters** - Add responsive filters to gig list
2. **Calendar View** - Month/week view of gigs
3. **Gig Creation** - Simplified mobile gig creation form
4. **Quick Actions** - Confirm attendance, contact buttons
5. **Push Notifications** - Reminders for upcoming gigs
6. **Dashboard Widget** - Upcoming gigs on mobile dashboard

## Success Metrics

1. **Adoption** - % of band members using mobile gig view
2. **Engagement** - Frequency of gig detail views
3. **Actions** - Number of attendance confirmations via mobile
4. **Performance** - Page load times < 2s on 3G
5. **Satisfaction** - User feedback on mobile gig experience

## Dependencies

### Required Components (Already Exist)
- ✅ [`MobileLayout`](src/components/atomic-crm/layout/MobileLayout.tsx:10), [`MobileHeader`](src/components/atomic-crm/layout/MobileHeader.tsx:1), [`MobileContent`](src/components/atomic-crm/layout/MobileContent.tsx:3)
- ✅ [`InfiniteListBase`](src/components/atomic-crm/contacts/ContactList.tsx:81) and [`InfinitePagination`](src/components/atomic-crm/misc/InfinitePagination.tsx)
- ✅ [`useIsMobile`](src/hooks/use-mobile.ts) hook
- ✅ [`DealShow`](src/components/atomic-crm/deals/DealShow.tsx:36) - All gig detail sections already built
- ✅ Card, Button, Badge components

### Required Data (Already Exist)
- ✅ `deals` table with gig fields
- ✅ `deals_summary` view
- ✅ `venues`, `gig_members`, `set_lists` tables
- ✅ All relationships and RLS policies

### Icons Needed
- Calendar (lucide-react) - for navigation

## Conclusion

**Simplified Approach:** By reusing the existing desktop deals UI with minimal mobile adaptations, we can add gig functionality to mobile in **6-10 hours instead of 3-4 days**.

### Key Simplifications

1. **Reuse [`DealShow`](src/components/atomic-crm/deals/DealShow.tsx:36)** - All gig detail sections already exist
2. **Simple List View** - Just need a mobile card list (no Kanban)
3. **Follow Existing Pattern** - Same `useIsMobile()` approach as contacts/companies
4. **Minimal New Code** - 2 new files, 3 modified files

### What Band Members Get

- ✅ View all gigs in a mobile-friendly list
- ✅ See full gig details (venue, date, time, fee, notes)
- ✅ Access set lists on the go
- ✅ View band member assignments
- ✅ Add notes to gigs
- ✅ See venue information and contacts
- ✅ All existing desktop features work on mobile

The mobile gig interface will make the app significantly more useful for band members who need gig information while traveling or at venues, with minimal development effort by leveraging existing components.
