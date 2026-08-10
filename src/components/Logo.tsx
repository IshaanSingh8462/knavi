interface LogoProps {
  className?: string;
}

export default function Logo({ className = 'w-7 h-8 text-primary' }: LogoProps) {
  return (
    <svg viewBox="0 0 484 606" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <path
        d="M410 84C410 108.3 390.3 128 366 128C341.7 128 322 108.3 322 84C322 59.7 341.7 40 366 40C390.3 40 410 59.7 410 84Z"
        stroke="currentColor"
        strokeWidth="34"
      />
      <path
        d="M118 522C118 546.3 98.3 566 74 566C49.7 566 30 546.3 30 522C30 497.7 49.7 478 74 478C98.3 478 118 497.7 118 522Z"
        stroke="currentColor"
        strokeWidth="34"
      />
      <path
        d="M366 84H258C199 84 165 155 165 197C165 255 210 300 258 306"
        stroke="currentColor"
        strokeWidth="34"
        strokeLinecap="round"
      />
      <path
        d="M258 320C310 326 355 365 355 415C355 463 320 500 268 500H74"
        stroke="currentColor"
        strokeWidth="34"
        strokeLinecap="round"
      />
    </svg>
  );
}