var svg = d3.select("#main svg.aperture")
            .attr("width", 3200)
            .attr("height", 2000)
            .attr("id","largemap");

svg.append("svg:image")
  .attr("xlink:href", "view.jpg")

const main_svg = d3.select("#main svg.aperture").attr("class", "zoom")
  , mini_svg   = d3.select("#mini svg").append("g").attr("class", "zoom")
  // store the image's initial viewBox
  , viewbox = main_svg.attr("viewBox").split(' ').map(d => +d)
  , extent = [
          [viewbox[0], viewbox[1]]
        , [(viewbox[2] - viewbox[0]), (viewbox[3] - viewbox[1])]
      ]
  , brush  = d3.brush()
        .extent(extent)
        .on("brush", brushed)
  , zoom = d3.zoom().scaleExtent([0.05, 1]).on("zoom", zoomed)
;

// Apply the brush to the minimap, and also apply the zoom behavior here
mini_svg
    .call(brush)
    .call(brush.move, brush.extent())
    .call(zoom)
;
// Apply the zoom behavior to the main svg
main_svg
    .call(zoom)
;


function brushed() {
    // Ignore brush-via-zoom
    if (d3.event.sourceEvent && d3.event.sourceEvent.type === "zoom") return;

    let sel = d3.event.selection
      , vb = sel
            ? [sel[0][0], sel[0][1], (sel[1][0] - sel[0][0]), (sel[1][1] - sel[0][1])]
            : viewbox
      , k = vb[3] / viewbox[3] //scale幾倍
      , t = d3.zoomIdentity.translate(vb[0], vb[1]).scale(k)
    ;
    mini_svg
        .property("__zoom", t)
    ;
    main_svg
        .attr("viewBox", vb.join(' '))
        .property("__zoom", t)
    ;
} // brushed()

function zoomed() {
    // If the zoom input was on the minimap, forward it to the main SVG
    if(this === mini_svg.node()) {
        return main_svg.call(zoom.transform, d3.event.transform);
    }

    // Ignore zoom via brush
    if(!d3.event.sourceEvent || d3.event.sourceEvent.type === "brush") return;

    // Process the zoom event on the main SVG
    let t = d3.event.transform;
    t.x = t.x < viewbox[0] ? viewbox[0] : t.x;
    t.x = t.x > viewbox[2] ? viewbox[2] : t.x;
    t.y = t.y < viewbox[1] ? viewbox[1] : t.y;
    t.y = t.y > viewbox[3] ? viewbox[3] : t.y;
    if(t.k === 1) t.x = t.y = 0;

    const vb = [t.x, t.y, viewbox[2] * t.k, viewbox[3] * t.k];

    main_svg.attr("viewBox", vb.join(' '));
    mini_svg
        .property("__zoom", t)
        .call(
              brush.move
            , [[t.x, t.y], [t.x + vb[2], t.y + vb[3]]]
          )
    ;
} // zoomed()