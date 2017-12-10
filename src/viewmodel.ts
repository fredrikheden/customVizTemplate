module powerbi.extensibility.visual {
    "use strict";

  export class VisualViewModel {
      dataPoints: VisualDataPoint[];
  };

  export class VisualDataPoint {
    dummyCategory: string;
    dummyMeasure: number;
    selectionId: ISelectionId;
  };

}
