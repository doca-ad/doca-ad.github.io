import project1_1 from "@/assets/01/1.jpg";
import project1_2 from "@/assets/01/2.jpg";

import project2_1 from "@/assets/02/1.jpg";
import project2_2 from "@/assets/02/2.jpg";
import project2_3 from "@/assets/02/3.jpg";

import project3_1 from "@/assets/03/1.jpg";
import project3_2 from "@/assets/03/2.jpg";
import project3_3 from "@/assets/03/3.jpg";

import project4_1 from "@/assets/04/1.jpg";
import project4_2 from "@/assets/04/2.jpg";
import project4_3 from "@/assets/04/3.jpg";

import project5_1 from "@/assets/05/1.jpg";
import project5_2 from "@/assets/05/2.jpg";
import project5_3 from "@/assets/05/3.jpg";
import project5_4 from "@/assets/05/4.jpg";
import project5_5 from "@/assets/05/5.jpg";

export interface ProjectImage {
	id: string;
	url: string;
	alt?: string;
}

export interface Project {
	id: string;
	title: string;
	home: boolean;
	location: string;
	year: string;
	type: string;
	description: string;
	images: ProjectImage[];
}

export const projects: Project[] = [
	{
		id: "project-1",
		title: "HOUSE BY DANUBE",
		location: "Fetesti, Romania",
		year: "2024",
		type: "Architecture",
		home: true,
		description: "The project is strongly defined by its relationship to the Danube River and its deliberate southern orientation. One of the site’s most distinctive characteristics lies in its cardinal positioning, with the southern axis aligning directly with the main river view. Embracing this natural condition, the design opens itself towards the landscape, establishing expansive glazed surfaces that frame the panorama and dissolve the boundary between interior and exterior. These transparent elements not only strengthen the transversal axis—linking entrance, dwelling, courtyard, and river—but also act as delicate thresholds, blurring the line between built space and natural surroundings.Set within a rural context, the project draws inspiration from the surrounding vernacular. The presence of predominantly single-story houses informed a restrained volumetric approach. The result is a discreet silhouette: a low, elongated roof with an attic-like upper floor, ensuring the intervention integrates seamlessly into the existing urban fabric.Materiality plays a pivotal role in grounding the architecture within its context. Local textures and finishes are employed to accentuate the clarity of the geometry while anchoring the building deeply into its landscape. Through this interplay of volume, orientation, and material, the house emerges as both a continuation of its environment and a contemporary reinterpretation of place.",
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
		home: true,
		type: "Interior Design",
		title: "VIEW TOWARDS SIBIU",
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
	{
		id: "project-3",
		home: false,
		location: "Fetești, Romania",
		year: "2024",
		type: "Interior Design",
		title: "MEDICAL CLINIC IN FETEȘTI",
		description: "The project responds to the pressing need for modern, community-oriented medical infrastructure in southern Romania. Small-scale private clinics play a crucial role in providing accessible healthcare, and this facility was conceived as both a functional treatment space and a welcoming interface between the residents of Fetești and contemporary medical care. Situated on the ground floor of a residential building, the facility opens generously toward the city through expansive glazing, reinforcing transparency and accessibility. A naturally lit corridor traverses the site, connecting both sides of the building and establishing a visual and spatial link within the urban fabric. This gesture strengthens the relationship between the clinic and its context, turning the passage of light and people into an integral part of the design. Inside, the rounded geometry of walls enhances spatial flow, softening transitions and making circulation intuitive and welcoming. These curves are not only a spatial device but also a strategy for durability and maintenance in high-traffic areas. By funneling natural light deeper into the core, the rounded surfaces amplify brightness along the corridor, reducing reliance on artificial lighting and creating a more uplifting atmosphere for patients and staff alike. Materiality was carefully selected to balance performance and aesthetics. Surfaces are robust, easy to maintain, and hygienically suitable for a medical environment, while also contributing to a calm and reassuring atmosphere. The result is a medical facility that transcends its purely functional role—becoming a civic presence that fosters trust, comfort, and connection between healthcare and community life.",
		images: [
			{
				id: "arch-1",
				url: project3_1,
			},
			{
				id: "arch-2",
				url: project3_2,
			},
			{
				id: "arch-3",
				url: project3_3,
			}
		]
	},
	{
		id: "project-4",
		home: false,
		location: "Bucharest, Romania",
		year: "2024",
		type: "Interior Design",
		title: "INTERIOR DESIGN FOR A PRIVATE RESIDENCE",
		description: "Situated in the quiet outskirts of Bucharest, the residence is part of a neighborhood enclave that offers a sense of community while remaining shielded from the city’s constant motion. This condition of calmness becomes the foundation of the interior design concept, where serenity and balance define the atmosphere of the home. The design weaves together classical elements and contemporary features, creating a dialogue between timeless coziness and modern comfort. Rather than favoring one over the other, the project seeks harmony—where tradition and innovation coexist to enrich daily life. Materiality plays a central role in achieving this balance. Refined surfaces of natural stone provide a tactile, enduring presence, elevating the sense of permanence and sophistication. In contrast, soft textiles introduce warmth and intimacy, softening the dialogue and ensuring that hardness and softness, elegance and comfort, are in constant interplay. Light becomes an essential guide within the spatial composition. The arrangement of elements responds carefully to the natural rhythm of daylight, ensuring that each room captures a specific quality of light throughout the day. This integration transforms light from a mere functional necessity into a design element that enriches daily experience and emphasizes the fluidity of space. The result is an interior where material, light, and form converge to create a refined yet welcoming home—one that resonates with calmness while embracing both classical tradition and contemporary living.",
		images: [
			{
				id: "arch-1",
				url: project4_1,
			},
			{
				id: "arch-2",
				url: project4_2,
			},
			{
				id: "arch-3",
				url: project4_3,
			}
		]
	},
	{
		id: "project-5",
		home: false,
		location: "Sibiu Romania",
		year: "2025",
		type: "Interior Design",
		title: "INTERIOR DESIGN FOR A PRIVATE RESIDENCE",
		description: "The design concept is built around a continuous horizontal band of color that visually anchors and unifies the kitchen, dining and living areas. A folding glass partition separates the kitchen from the dining space, allowing it to open up entirely or close off as needed - offering flexibility without compromising flow. The result is a balanced, functional interior where cohesion and comfort defines the experience.",
		images: [
			{
				id: "arch-1",
				url: project5_1,
			},
			{
				id: "arch-2",
				url: project5_2,
			},
			{
				id: "arch-3",
				url: project5_3,
			},
			{
				id: "arch-4",
				url: project5_4,
			},
			{
				id: "arch-5",
				url: project5_5,
			}
		]
	},
];
