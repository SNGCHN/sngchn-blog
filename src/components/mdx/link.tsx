import Link from "next/link";

// 외부 링크(http~)는 새 탭으로, 내부 경로(/...)는 next/link로 클라이언트 이동,
// 앵커(#...)는 같은 페이지라 plain <a>.
export function MdxLink({
  href = "",
  ...props
}: React.AnchorHTMLAttributes<HTMLAnchorElement>) {
  if (/^https?:\/\//.test(href)) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" {...props} />
    );
  }
  if (href.startsWith("/")) {
    return <Link href={href} {...props} />;
  }
  return <a href={href} {...props} />;
}
