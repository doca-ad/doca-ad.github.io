import project1_1 from "@/assets/01/1.jpg";
import project1_2 from "@/assets/01/2.jpg";

import project2_1 from "@/assets/02/1.jpg";
import project2_2 from "@/assets/02/2.jpg";
import project2_3 from "@/assets/02/3.jpg";


export interface ProjectImage {
  id: string;
  url: string;
  alt: string;
}

export interface Project {
  id: string;
  title: string;
  images: ProjectImage[];
}

export const projects: Project[] = [
  {
    id: "project-1",
    title: "House by Danube",
    location: "Fetesti, Romania",
    year: "2024",
    type: "Architecture",

    images: [
      {
        id: "arch-1",
        url: project1_1,
        alt: "Modern architectural exterior"
      },
      {
        id: "arch-2", 
        url: project1_2,
        alt: "Contemporary interior design"
      }
    ]
  },

  {
    id: "project-2",
    location: "Sibiu, Romania",
    year: "2025",
    type: "Interior Design",
    title: "View towards Sibiu",
    description: "The project redefines a generous, unused balcony by integrating it into the main living areas, creating a more open and functional layout. The core design gesture is a continuous circulation loop that connects the entry hall, the kitchen-separated by glass partitions- and the living & dining space. This spatial flow generates a central nucleus, highlighted through subtle changes in plaster texture or color on walls, furniture and ceiling. Along this new ceiling contour, black spotlights are aligned precisely to trace and emphasise the fiow, reinforcing both spatial logic and visual rhythm.",
    images: [
      {
        id: "arch-1",
        url: project2_1,
        alt: "Modern architectural exterior"
      },
      {
        id: "arch-2", 
        url: project2_2,
        alt: "Contemporary interior design"
      },
      {
        id: "arch-3", 
        url: project2_3,
        alt: "Contemporary interior design"
      }
    ]
  },
];
