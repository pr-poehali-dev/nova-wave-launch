import Icon from "@/components/ui/icon";

const features = [
  {
    icon: "BookOpen",
    title: "Персональные задания",
    desc: "Каждый ученик получает свой набор упражнений — в зависимости от уровня и пробелов.",
  },
  {
    icon: "PenLine",
    title: "Самоанализ",
    desc: "После выполнения — рефлексия: что получилось, что нет и над чем работать дальше.",
  },
  {
    icon: "TrendingUp",
    title: "Рост в реальном времени",
    desc: "Видно, как растёт грамотность: прогресс по темам, ошибки, динамика.",
  },
];

export default function Featured() {
  return (
    <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center min-h-screen px-6 py-12 lg:py-0 bg-white">
      <div className="flex-1 h-[400px] lg:h-[800px] mb-8 lg:mb-0 lg:order-2">
        <img
          src="/images/mountain-landscape.jpg"
          alt="Обучение русскому языку"
          className="w-full h-full object-cover"
        />
      </div>
      <div className="flex-1 text-left lg:h-[800px] flex flex-col justify-center lg:mr-12 lg:order-1">
        <h3 className="uppercase mb-4 text-sm tracking-wide text-neutral-500">
          Как это работает
        </h3>
        <p className="text-2xl lg:text-4xl mb-10 text-neutral-900 leading-tight">
          Не просто упражнения — система, которая знает каждого ученика и помогает расти осознанно.
        </p>
        <div className="flex flex-col gap-6 mb-10">
          {features.map((f) => (
            <div key={f.title} className="flex items-start gap-4">
              <div className="mt-1 shrink-0 w-10 h-10 bg-neutral-100 flex items-center justify-center">
                <Icon name={f.icon} size={20} className="text-neutral-700" />
              </div>
              <div>
                <p className="font-semibold text-neutral-900 mb-1">{f.title}</p>
                <p className="text-neutral-500 text-sm leading-relaxed">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
        <button className="bg-black text-white border border-black px-4 py-2 text-sm transition-all duration-300 hover:bg-white hover:text-black cursor-pointer w-fit uppercase tracking-wide">
          Узнать подробнее
        </button>
      </div>
    </div>
  );
}
