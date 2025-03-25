// "use client";

// import React, { useEffect, useState } from "react";
// import Image from "next/image";
// import { useTheme } from "next-themes";

// interface SuperMintLogoProps {
//   showText?: boolean;
//   textSize?: string;
//   showIcon?: boolean;
//   iconSize?: string;
//   spacing?: number;
// }

// const CelebrateLogo: React.FC<SuperMintLogoProps> = ({
//   showText = true,
//   textSize = "25px",
//   showIcon = true,
//   iconSize = "35px",
//   spacing = 1,
// }) => {
//   const { resolvedTheme } = useTheme();
//   const [logoSrc, setLogoSrc] = useState<string | null>(null);

//   useEffect(() => {
//     const loadLogo = async () => {
//       const { WhiteSuperMintLogo, BlackSuperMintLogo } = await import(
//         "@/public/base64/supermint-logos"
//       );
//       setLogoSrc(
//         resolvedTheme === "dark" ? WhiteSuperMintLogo : BlackSuperMintLogo
//       );
//     };
//     loadLogo();
//   }, [resolvedTheme]);

//   const getTextSizeClass = (size: string) => {
//     const pixels = parseInt(size);
//     if (pixels <= 16) return "text-base";
//     if (pixels <= 18) return "text-lg";
//     if (pixels <= 20) return "text-xl";
//     if (pixels <= 24) return "text-2xl";
//     if (pixels <= 30) return "text-3xl";
//     if (pixels <= 36) return "text-4xl";
//     if (pixels <= 48) return "text-5xl";
//     return "text-6xl";
//   };

//   const textSizeClass = getTextSizeClass(textSize);

//   return (
//     <div className="flex items-center">
//       {showIcon && logoSrc && (
//         <div className="relative" style={{ width: iconSize, height: iconSize }}>
//           <Image
//             src={logoSrc}
//             alt="SuperMint Logo"
//             fill
//             sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
//             className="object-contain"
//             priority={true}
//           />
//         </div>
//       )}
//       {showText && (
//         <div className={showIcon ? `ml-${spacing}` : ""}>
//           <div className="flex items-center">
//             <div className={`flex flex-col items-center space-y-${spacing}`}>
//               <div className={`flex gap-${spacing}`}>
//                 <span
//                   className={`${textSizeClass} text-emerald-500 leading-none`}
//                 >
//                   celebrating
//                 </span>
//                 <span
//                   className={`${textSizeClass} text-zinc-700 dark:text-zinc-100 leading-none`}
//                 >
//                   your
//                 </span>
//               </div>
//               <span
//                 className={`${textSizeClass} text-sky-600 dark:text-sky-400 leading-none tracking-normal`}
//               >
//                 impact
//               </span>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default CelebrateLogo;
