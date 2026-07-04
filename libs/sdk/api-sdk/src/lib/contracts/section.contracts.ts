// Frontend interpretations of the explicit Backend Contracts
// These must strictly match what is returned by the SectionLoaders in the .NET API.

export interface HeroSectionData {
  items: Array<{
    title: string;
    subTitle: string;
    description: string;
    buttonText: string;
    buttonLink: string;
    heroImage: string;
  }>;
}

export interface AboutSectionData {
  title: string;
  shortDescription: string;
  longDescription: string;
  mission: string;
  vision: string;
  aboutImage: string;
}

export interface ServicesSectionData {
  items: Array<{
    title: string;
    shortDescription: string;
    imageUrl: string;
  }>;
}

export interface ProjectsSectionData {
  items: Array<{
    title: string;
    shortDescription: string;
    imageUrl: string;
    projectTypeName: string;
  }>;
}

export interface TestimonialsSectionData {
  items: Array<{
    clientName: string;
    clientPosition: string;
    clientCompany: string;
    rating: number;
    imageUrl: string;
  }>;
}

export interface ContactSectionData {
  items: Array<{
    categoryName: string;
    value: string;
  }>;
}

/**
 * Union type representing the possible payload for any section.
 */
export type SectionPayloadData = 
  | HeroSectionData 
  | AboutSectionData 
  | ServicesSectionData 
  | ProjectsSectionData 
  | TestimonialsSectionData 
  | ContactSectionData 
  | any;
