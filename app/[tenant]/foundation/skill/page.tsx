import { getSkill, getSkillMeta } from '@/lib/skill.server'
import { SkillPage } from './SkillPage'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Design Skill' }

interface Props { params: { tenant: string } }

export default async function DesignSkillPage({ params }: Props) {
  const [skill, meta] = await Promise.all([
    getSkill(params.tenant),
    getSkillMeta(params.tenant),
  ])
  return <SkillPage tenant={params.tenant} initialSkill={skill} initialUploadedAt={meta?.uploadedAt ?? null} />
}
