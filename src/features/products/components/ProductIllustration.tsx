import { productGroup, searchable } from "../utils/catalog";

export default function ProductIllustration({
  category,
}: {
  category: string;
}) {
  const group = productGroup({ category });
  const normalized = searchable(category);
  let drawing;
  if (group === "seating")
    drawing = (
      <>
        <path d="M36 94V62Q36 43 54 43H107Q125 43 125 62V94" fill="#f6f7ef" />
        <path d="M79 45V87M42 86H119M32 109L28 128M128 109L132 128" />
        <path
          d="M26 77Q16 77 16 88V107Q16 115 26 115H134Q144 115 144 106V88Q144 77 134 77Q125 77 125 86V96H35V86Q35 77 26 77Z"
          fill="#cbd3bd"
        />
        <path d="M36 102H124" opacity=".5" />
      </>
    );
  else if (group === "tables")
    drawing = (
      <>
        <path
          d="M41 79L31 132M121 78L135 129M92 84L96 118M68 86L62 119"
          strokeWidth="4"
        />
        <ellipse cx="80" cy="73" rx="63" ry="23" fill="#d6c4aa" />
        <path d="M17 74V80C25 105 137 105 143 80V74" fill="#bfae95" />
        <ellipse cx="80" cy="73" rx="63" ry="23" fill="#e8dbca" />
        <path d="M33 70Q72 57 122 70M48 80Q78 85 108 80" opacity=".25" />
        <path
          d="M103 39V62M92 47Q103 56 103 48Q117 46 114 35Q104 32 103 44Q91 31 86 40Q86 46 92 47Z"
          fill="#a7b49a"
        />
        <path d="M95 57H112L109 70H99Z" fill="#f6f4eb" />
      </>
    );
  else if (group === "storage")
    drawing = (
      <>
        <path d="M32 124L30 137M129 124L131 137" strokeWidth="4" />
        <rect x="23" y="43" width="115" height="82" rx="3" fill="#d0d7c7" />
        <path d="M23 39H138V47H23Z" fill="#eaf0e2" />
        <path d="M80 48V124M87 86H131M87 53H131V118H87ZM30 53H73V118H30Z" />
        <path d="M64 76V89M106 70H112M106 101H112" strokeWidth="3" />
        <path d="M42 39V30Q36 20 42 13H58Q64 20 58 30V39Z" fill="#ecece0" />
        <path d="M98 39V29H121V39M98 34H121" />
      </>
    );
  else if (group === "bedroom")
    drawing = (
      <>
        <path d="M27 71V43Q27 35 36 35H126Q134 35 134 43V72" fill="#cbbeb3" />
        <path d="M30 64H131L147 105H13Z" fill="#f8f4ec" />
        <path d="M13 105H147V122H13ZM22 122V135M138 122V135" fill="#e5dace" />
        <path d="M38 51H69L73 72H33ZM91 51H121L126 72H88Z" fill="#ebe6dd" />
        <path d="M26 80H136L147 107H13Z" fill="#b7c2a6" />
        <path d="M20 96H142" opacity=".35" />
      </>
    );
  else if (group === "lighting")
    drawing = (
      <>
        <path d="M81 74V133" strokeWidth="4" />
        <ellipse cx="81" cy="136" rx="31" ry="5" fill="#bfc7aa" />
        <path d="M48 28H111L130 76H30Z" fill="#f1e5c5" />
        <ellipse cx="80" cy="76" rx="50" ry="5" fill="#e0d0a7" />
        <path
          d="M58 34L50 70M75 34L73 70M91 34L96 70M104 34L116 70"
          opacity=".23"
        />
        <path d="M105 82V99" />
        <circle cx="105" cy="101" r="2" fill="currentColor" />
      </>
    );
  else if (group === "plants")
    drawing = (
      <>
        <path d="M80 98V40M80 64L58 50M81 80L104 64" />
        <path
          d="M78 60C46 64 33 35 38 30C65 23 82 43 78 60ZM84 75C90 47 122 42 127 50C128 77 106 88 84 75ZM81 45C61 23 77 8 88 9C107 25 95 44 81 45Z"
          fill="#a7bb95"
        />
        <path d="M54 95H110L100 134Q81 144 64 134Z" fill="#eee7d6" />
        <ellipse cx="82" cy="95" rx="28" ry="6" fill="#c8c1a9" />
        <path d="M80 96V86M69 103L74 131M95 103L91 131" opacity=".5" />
      </>
    );
  else if (/tham/.test(normalized))
    drawing = (
      <>
        <path d="M39 36L136 54L120 126L23 107Z" fill="#d9cabb" />
        <path
          d="M45 47L123 62L112 114L36 100ZM73 62L98 85L78 101L56 78Z"
          fill="#eee6d9"
        />
        {[0, 1, 2, 3, 4, 5, 6].map((i) => (
          <path
            key={i}
            d={`M${41 + i * 14} ${36 + i * 2.6}l2 -7M${25 + i * 14} ${108 + i * 2.6}l-2 7`}
          />
        ))}
      </>
    );
  else if (/tranh/.test(normalized))
    drawing = (
      <>
        <rect x="33" y="21" width="95" height="121" rx="2" fill="#c4b299" />
        <rect x="40" y="28" width="81" height="107" fill="#f5f1e7" />
        <circle cx="93" cy="58" r="16" fill="#d8c093" stroke="none" />
        <path d="M46 126V99L73 67L115 125Z" fill="#b6c1a3" stroke="none" />
        <path d="M46 126L88 87L115 111V126Z" fill="#849876" stroke="none" />
      </>
    );
  else if (/goi/.test(normalized))
    drawing = (
      <>
        <path
          d="M37 38Q80 50 124 36Q112 80 125 123Q81 112 36 125Q49 81 37 38Z"
          fill="#c5ccb3"
        />
        <path
          d="M47 48Q80 58 114 47Q104 80 115 113Q82 104 47 115Q57 81 47 48Z"
          opacity=".3"
        />
        <path d="M62 61L99 99M100 61L64 99" opacity=".16" />
      </>
    );
  else
    drawing = (
      <>
        <path d="M46 57L38 132H126L116 57Z" fill="#e4d5bf" />
        <path d="M63 67V40Q63 18 81 18Q100 18 100 40V67" strokeWidth="5" />
        <path d="M58 92H107V117H58Z" fill="#ced4ba" />
        <path d="M45 125H119" opacity=".35" />
      </>
    );
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 160 160"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="relative h-[65%] w-[65%] text-[#78826c] transition-transform duration-500 group-hover:scale-[1.04]"
    >
      {drawing}
    </svg>
  );
}
