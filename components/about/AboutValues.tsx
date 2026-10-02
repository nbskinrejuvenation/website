import {
  IconBadge,
  IconDropper,
  IconHeartHands,
  IconNutrition,
  IconSparkleFace,
} from './AboutIllustrations'

const VALUES = [
  {
    icon: <IconNutrition />,
    title: 'Qualified nutritionist',
    body: 'Lilian, our founder and head therapist, is a qualified nutritionist.',
  },
  {
    icon: <IconSparkleFace />,
    title: 'Beauty therapy since 2010',
    body: 'Years in some of the most recognised skin clinics in Australia.',
  },
  {
    icon: <IconHeartHands />,
    title: 'A holistic approach',
    body: 'Beyond the perfect skin: a healthier and more balanced lifestyle.',
  },
  {
    icon: <IconDropper />,
    title: 'Only the best',
    body: 'The best products and equipment in the market for each individual.',
  },
]

export function AboutValues() {
  return (
    <section className="border-y border-sage-300 bg-sage-100 py-12 md:py-14">
      <ul
        className="section-container grid gap-8 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6"
        role="list"
      >
        {VALUES.map(v => (
          <li key={v.title} className="flex items-start gap-4">
            <IconBadge>{v.icon}</IconBadge>
            <div>
              <h2 className="font-display text-xl text-sage-900">{v.title}</h2>
              <p className="mt-1 text-[13px] leading-relaxed text-sage-800">{v.body}</p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  )
}
