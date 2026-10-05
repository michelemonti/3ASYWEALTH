import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { PageHeader } from '@/components/PageHeader'
import { Button } from '@/components/ui/button'

export default function NotFound() {
  const { t } = useTranslation()
  return (
    <div className="py-10">
      <PageHeader title={t('notFound.title')} description={t('notFound.body')} />
      <Button asChild>
        <Link to="/">{t('notFound.back')}</Link>
      </Button>
    </div>
  )
}
