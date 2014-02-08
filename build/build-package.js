({
    baseUrl: "../lib",
    name: "../deps/almond/almond",
    include: ["export"],
    paths: {
        'assert': 'common/assert',
        'events': 'common/events',
        'util': 'common/util',
    },
    out: "../assets/js/sipcore.min.js",
    wrap: true,
    optimize: "uglify2"
})
