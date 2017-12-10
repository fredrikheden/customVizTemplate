module powerbi.extensibility.visual {
    "use strict";

    function visualTransform(options: VisualUpdateOptions, host: IVisualHost, thisRef: Visual): VisualViewModel {            
        let dataViews = options.dataViews;
        let viewModel: VisualViewModel = {
            dataPoints: []
        };
        if ( !Utils.hasValidDataViews(dataViews) ) {
            return viewModel;
        }

        let objects = dataViews[0].metadata.objects;
       
        var selectionIDs = Utils.getSelectionIds(dataViews[0], host);

        let measureIndex = Utils.getColumnIndex(dataViews[0].metadata, "measure");
        let categoryIndex = Utils.getColumnIndex(dataViews[0].metadata, "category");

        let visualDataPoints: VisualDataPoint[] = [];
        for( var i = 0; i < dataViews[0].table.rows.length; i++) {
            var row = dataViews[0].table.rows[i];
            visualDataPoints.push({
                dummyCategory:  categoryIndex !== null ? <string>row[categoryIndex] : null,
                dummyMeasure: measureIndex !== null ? <number>row[measureIndex] : null,
                selectionId: selectionIDs[i]
            });
        }
 
        return {
            dataPoints: visualDataPoints
        };
    }     

    export class Visual implements IVisual {
        private settings: VisualSettings;
        private model: VisualViewModel;
        private host: IVisualHost;
        private svg: d3.Selection<SVGElement>;
        private selectionManager: ISelectionManager;
       
        constructor(options: VisualConstructorOptions) {
            this.host = options.host;
            this.selectionManager = options.host.createSelectionManager();
            let svg = this.svg = d3.select(options.element)
                .append('svg')
                .classed('myCustomVisual', true);
        }

        public update(options: VisualUpdateOptions) {
            this.settings = Visual.parseSettings(options && options.dataViews && options.dataViews[0]);
            this.model = visualTransform(options, this.host, this);
            let width = options.viewport.width;
            let height = options.viewport.height;
            this.svg.attr("width", width).attr("height", height);

            // Convert data points to points on screen.
            var renderData = [];
            for (var i = 0; i < this.model.dataPoints.length; i++) {
                renderData.push( {
                    x: width/2,
                    y: height/2,
                    r: d3.min([width, height])/2
                });
            }

            var s = this.svg.selectAll(".myRects").data(renderData);
            s.enter().append("circle").classed("myRects", true);
            s.exit().remove();
            s.attr("cx", function(d) {return d.x;})
            s.attr("cy", function(d) {return d.y;})
            s.attr("r", function(d) {return d.r;})
            s.attr("fill", "#F2C811")
            ;
        }

        private static parseSettings(dataView: DataView): VisualSettings {
            return VisualSettings.parse(dataView) as VisualSettings;
        }

        public enumerateObjectInstances(options: EnumerateVisualObjectInstancesOptions): VisualObjectInstance[] | VisualObjectInstanceEnumerationObject {
            return VisualSettings.enumerateObjectInstances(this.settings || VisualSettings.getDefault(), options);
        }
    }
}