import project1_1 from "@/assets/project1-1.jpg";
import project1_2 from "@/assets/project1-2.jpg";
import project2_1 from "@/assets/project2-1.jpg";

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
    id: "architectural-modernism",
    title: "Architectural Modernism",
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
    id: "brand-identity",
    title: "Brand Identity Suite",
    images: [
      {
        id: "brand-1",
        url: project2_1,
        alt: "Premium brand identity design"
      }
    ]
  },
  {
    id: "digital-experience",
    title: "Digital Experience",
    images: [
      {
        id: "digital-1",
        url: project1_1,
        alt: "Digital interface design"
      }
    ]
  }
];