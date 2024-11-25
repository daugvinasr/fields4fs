import type { Shape } from "@/types/types.ts";

export function generateXML(shapes: Shape[]): string {
  let minX = Number.MAX_SAFE_INTEGER;
  let minY = Number.MAX_SAFE_INTEGER;
  let maxX = Number.MIN_SAFE_INTEGER;
  let maxY = Number.MIN_SAFE_INTEGER;

  for (const shape of shapes) {
    for (const point of shape.outline) {
      if (point[0] < minX) {
        minX = point[0];
      }
      if (point[0] > maxX) {
        maxX = point[0];
      }
      if (point[1] < minY) {
        minY = point[1];
      }
      if (point[1] > maxY) {
        maxY = point[1];
      }
    }
  }

  const centerX = Math.floor((maxX + minX) / 2);
  const centerY = Math.floor((maxY + minY) / 2);

  let xmlContent = `<?xml version="1.0" encoding="iso-8859-1"?>
<i3D name="fields.i3d" version="1.6" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:noNamespaceSchemaLocation="http://i3d.giants.ch/schema/i3d-1.6.xsd">
<Asset>
 <Export program="GIANTS Editor 64bit" version="10.0.2"/>
</Asset>
<Files>
</Files>
<Materials>
</Materials>
<Shapes>
</Shapes>
<Scene>
 <TransformGroup name="fields" nodeId="1">`;

  const mainTransformGroupNodeIds: number[] = [];
  let nextNodeId = 2; // Start from 2 since 1 is used by the main TransformGroup

  // Add each field
  shapes.forEach((shape, i) => {
    // Calculate center for this specific shape
    let shapeMinX = Number.MAX_SAFE_INTEGER;
    let shapeMinY = Number.MAX_SAFE_INTEGER;
    let shapeMaxX = Number.MIN_SAFE_INTEGER;
    let shapeMaxY = Number.MIN_SAFE_INTEGER;

    for (const point of shape.outline) {
      if (point[0] < shapeMinX) {
        shapeMinX = point[0];
      }
      if (point[0] > shapeMaxX) {
        shapeMaxX = point[0];
      }
      if (point[1] < shapeMinY) {
        shapeMinY = point[1];
      }
      if (point[1] > shapeMaxY) {
        shapeMaxY = point[1];
      }
    }

    const shapeCenterX = Math.floor((shapeMaxX + shapeMinX) / 2);
    const shapeCenterY = Math.floor((shapeMaxY + shapeMinY) / 2);

    // Transform shape center coordinates relative to global center
    const transformedCenterX = shapeCenterX - centerX;
    const transformedCenterZ = shapeCenterY - centerY;

    const fieldNum = i + 1;
    const fieldName = `field${String(fieldNum).padStart(2, '0')}`;
    const fieldNodeId = nextNodeId;
    nextNodeId++;

    mainTransformGroupNodeIds.push(fieldNodeId);

    xmlContent += `
     <TransformGroup name="${fieldName}" translation="0 0 0" nodeId="${fieldNodeId}">
         <TransformGroup name="polygonPoints" nodeId="${nextNodeId}">`;

    nextNodeId++;

    shape.outline.forEach((point, j) => {
      const transformedX = point[0] - centerX;
      const transformedZ = point[1] - centerY;

      xmlContent += `
         <TransformGroup name="point${j + 1}" translation="${transformedX} 0 ${transformedZ}" nodeId="${nextNodeId}"/>`;
      nextNodeId++;
    });

    xmlContent += `
         </TransformGroup>
         <TransformGroup name="nameIndicator" translation="${transformedCenterX} 0 ${transformedCenterZ}" nodeId="${nextNodeId}">
             <Note name="Note" visibility="false" nodeId="${nextNodeId + 1}" text="${fieldName}" color="4278190080" fixedSize="true"/>
         </TransformGroup>
         <TransformGroup name="teleportIndicator" translation="${transformedCenterX} 0 ${transformedCenterZ}" nodeId="${nextNodeId + 2}"/>
     </TransformGroup>`;

    nextNodeId += 3;
  });

  xmlContent += `
     </TransformGroup>
 </Scene>
 <UserAttributes>
     <UserAttribute nodeId="1">
         <Attribute name="onCreate" type="scriptCallback" value="FieldUtil.onCreate"/>
     </UserAttribute>`;

  for (const nodeId of mainTransformGroupNodeIds) {
    xmlContent += `
     <UserAttribute nodeId="${nodeId}">
         <Attribute name="angle" type="integer" value="90"/>
         <Attribute name="missionAllowed" type="boolean" value="true"/>
         <Attribute name="missionOnlyGrass" type="boolean" value="false"/>
         <Attribute name="nameIndicatorIndex" type="string" value="1"/>
         <Attribute name="polygonIndex" type="string" value="0"/>
         <Attribute name="teleportIndicatorIndex" type="string" value="2"/>
     </UserAttribute>`;
  }

  xmlContent += `
 </UserAttributes>
</i3D>`;

  return xmlContent;
}
