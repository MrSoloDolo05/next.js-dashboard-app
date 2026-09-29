import DashboardSkeleton from '@/app/ui/skeletons';

// Route-level loading UI. Because this file lives inside the (overview) route
// group, the skeleton is only shown for /dashboard - not for the sibling
// invoices/customers routes that share the same dashboard layout.
export default function Loading() {
  return <DashboardSkeleton />;
}
