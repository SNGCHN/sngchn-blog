export default function AboutPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-16">
      <h1 className="text-3xl font-bold text-warm-text mb-12 tracking-tight">
        소개
      </h1>
      <div className="prose">
        <p className="lead text-lg text-warm-text font-medium break-keep">
          안녕하세요, <strong>sngchn</strong>입니다. 미니멀한 디자인과
          깔끔한 코드를 좋아하는 풀스택 개발자입니다.
        </p>
        <p className="break-keep">
          소프트웨어 엔지니어링 여정을 기록하기 위해 이 블로그를
          시작했습니다. 글을 쓰는 것이 배움을 단단하게 만드는 가장 좋은
          방법이며, 지식을 공유하는 것이 커뮤니티에 기여하는 길이라고
          믿습니다.
        </p>
        <h2>기술 스택</h2>
        <ul>
          <li>Frontend: React, TypeScript, Tailwind CSS</li>
          <li>Backend: Node.js, Go, PostgreSQL</li>
          <li>Tools: VS Code, Figma, Docker</li>
        </ul>
        <h2>연락하기</h2>
        <p className="break-keep">
          Twitter나 GitHub에서 저를 찾으실 수 있습니다. 기술에 대해
          이야기하고 싶거나 가볍게 인사를 건네고 싶다면 언제든 연락주세요!
        </p>
      </div>
    </div>
  );
}
