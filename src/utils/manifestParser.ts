// Parser for IMS Common Cartridge manifest files

export interface ParsedCourse {
  title: string;
  courseCode: string;
  modules: Array<{
    id: string;
    title: string;
    itemCount: number;
  }>;
  resources: {
    assignments: number;
    discussions: number;
    pages: number;
    files: number;
    quizzes: number;
    externalLinks: number;
  };
  totalItems: number;
}

export function parseManifestXML(xmlContent: string): ParsedCourse | null {
  try {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlContent, "text/xml");

    // Check for parsing errors
    const parserError = xmlDoc.querySelector("parsererror");
    if (parserError) {
      console.error("XML parsing error");
      return null;
    }

    // Extract course title
    const titleElement = xmlDoc.querySelector("lomimscc\\:title lomimscc\\:string, title string");
    const title = titleElement?.textContent || "Untitled Course";

    // Extract course code (from identifier or title)
    const manifestElement = xmlDoc.querySelector("manifest");
    const courseCode = manifestElement?.getAttribute("identifier") || "";

    // Parse modules/organization structure
    const modules: ParsedCourse["modules"] = [];
    const moduleItems = xmlDoc.querySelectorAll("organization > item > item");
    
    moduleItems.forEach((moduleItem) => {
      const titleEl = moduleItem.querySelector(":scope > title");
      const moduleTitle = titleEl?.textContent || "Untitled Module";
      const subItems = moduleItem.querySelectorAll(":scope > item");
      
      modules.push({
        id: moduleItem.getAttribute("identifier") || "",
        title: moduleTitle,
        itemCount: subItems.length
      });
    });

    // Count resources by type
    const resources = {
      assignments: xmlDoc.querySelectorAll('resource[type*="learning-application-resource"]').length,
      discussions: xmlDoc.querySelectorAll('resource[identifier*="discussion"], resource[type="imsdt_xmlv1p1"]').length,
      pages: xmlDoc.querySelectorAll('resource[type="webcontent"]').length,
      files: xmlDoc.querySelectorAll('file[href*="web_resources"]').length,
      quizzes: xmlDoc.querySelectorAll('resource[type*="assessment"]').length,
      externalLinks: xmlDoc.querySelectorAll('resource[type*="imsbasiclti"]').length
    };

    const totalItems = modules.reduce((sum, mod) => sum + mod.itemCount, 0);

    return {
      title,
      courseCode,
      modules,
      resources,
      totalItems
    };
  } catch (error) {
    console.error("Error parsing manifest:", error);
    return null;
  }
}
