import EmptyState from '../components/EmptyState';

export default function NotFound() {
  return <EmptyState emoji="🤷" title="העמוד לא נמצא" text="הקישור שגוי או שהעמוד כבר לא קיים." cta={{ label: 'חזרה לפיד', to: '/' }} />;
}
