import MenuPageClient from './menu-page-client';

export default function MenuPage({ params }: { params: { outletId: string } }) {
  return <MenuPageClient outletId={params.outletId} />;
}
