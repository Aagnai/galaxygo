(function ($) {
    "use strict";

    // Spinner
    var spinner = function () {
        setTimeout(function () {
            if ($('#spinner').length > 0) {
                $('#spinner').removeClass('show');
            }
        }, 1);
    };
    spinner();
    
    
    // Back to top button
    $(window).scroll(function () {
        if ($(this).scrollTop() > 300) {
            $('.back-to-top').fadeIn('slow');
        } else {
            $('.back-to-top').fadeOut('slow');
        }
    });
    $('.back-to-top').click(function () {
        $('html, body').animate({scrollTop: 0}, 1500, 'easeInOutExpo');
        return false;
    });


    // Sidebar Toggler
    $('.sidebar-toggler').click(function () {
        $('.sidebar, .content').toggleClass("open");
        return false;
    });


    // Chart Global Color
    Chart.defaults.color = "#6C7293";
    Chart.defaults.borderColor = "#000000";


    // Worldwide Sales Chart
    // var ctx1 = $("#worldwide-sales").get(0).getContext("2d");
    // var myChart1 = new Chart(ctx1, {
    //     type: "bar",
    //     data: {
    //         labels: ["2016", "2017", "2018", "2019", "2020", "2021", "2022"],
    //         datasets: [{
    //                 label: "USA",
    //                 data: [15, 30, 55, 65, 60, 80, 95],
    //                 backgroundColor: "rgba(235, 22, 22, .7)"
    //             },
    //             {
    //                 label: "UK",
    //                 data: [8, 35, 40, 60, 70, 55, 75],
    //                 backgroundColor: "rgba(235, 22, 22, .5)"
    //             },
    //             {
    //                 label: "AU",
    //                 data: [12, 25, 45, 55, 65, 70, 60],
    //                 backgroundColor: "rgba(235, 22, 22, .3)"
    //             }
    //         ]
    //         },
    //     options: {
    //         responsive: true
    //     }
    // });


    // Salse & Revenue Chart
    // var ctx2 = $("#salse-revenue").get(0).getContext("2d");
    // var myChart2 = new Chart(ctx2, {
    //     type: "line",
    //     data: {
    //         labels: ["2016", "2017", "2018", "2019", "2020", "2021", "2022"],
    //         datasets: [{
    //                 label: "Salse",
    //                 data: [15, 30, 55, 45, 70, 65, 85],
    //                 backgroundColor: "rgba(235, 22, 22, .7)",
    //                 fill: true
    //             },
    //             {
    //                 label: "Revenue",
    //                 data: [99, 135, 170, 130, 190, 180, 270],
    //                 backgroundColor: "rgba(235, 22, 22, .5)",
    //                 fill: true
    //             }
    //         ]
    //         },
    //     options: {
    //         responsive: true
    //     }
    // });
    


    // Single Line Chart
 main($)


    // Single Bar Chart
    var ctx4 = $("#bar-chart").get(0).getContext("2d");
    var myChart4 = new Chart(ctx4, {
        type: "bar",
        data: {
            labels: ["Italy", "France", "Spain", "USA", "Argentina"],
            datasets: [{
                backgroundColor: [
                    "rgba(235, 22, 22, .7)",
                    "rgba(235, 22, 22, .6)",
                    "rgba(235, 22, 22, .5)",
                    "rgba(235, 22, 22, .4)",
                    "rgba(235, 22, 22, .3)"
                ],
                data: [55, 49, 44, 24, 15]
            }]
        },
        options: {
            responsive: true
        }
    });


    // Pie Chart
    var ctx5 = $("#pie-chart").get(0).getContext("2d");
    var myChart5 = new Chart(ctx5, {
        type: "pie",
        data: {
            labels: ["Italy", "France", "Spain", "USA", "Argentina"],
            datasets: [{
                backgroundColor: [
                    "rgba(235, 22, 22, .7)",
                    "rgba(235, 22, 22, .6)",
                    "rgba(235, 22, 22, .5)",
                    "rgba(235, 22, 22, .4)",
                    "rgba(235, 22, 22, .3)"
                ],
                data: [55, 49, 44, 24, 15]
            }]
        },
        options: {
            responsive: true
        }
    });


    // Doughnut Chart
    var ctx6 = $("#doughnut-chart").get(0).getContext("2d");
    var myChart6 = new Chart(ctx6, {
        type: "doughnut",
        data: {
            labels: ["Italy", "France", "Spain", "USA", "Argentina"],
            datasets: [{
                backgroundColor: [
                    "rgba(235, 22, 22, .7)",
                    "rgba(235, 22, 22, .6)",
                    "rgba(235, 22, 22, .5)",
                    "rgba(235, 22, 22, .4)",
                    "rgba(235, 22, 22, .3)"
                ],
                data: [55, 49, 44, 24, 15]
            }]
        },
        options: {
            responsive: true
        }
    });

    
})(jQuery);

function main($){
    
    $.ajax({
        url:"/admin/ChartDetails?value=365",
        method:"get",
        success:((res)=>{
            console.log(res,"hiiiiiiiiiii");
            var ctx3 = $("#line-chart").get(0).getContext("2d");
            var myChart3 = new Chart(ctx3, {
                type: "line",
                data: {
                    labels: ["January","February","March","April","May","June","July","August","September","October","November","December"],
                    datasets: [{
                        label: "Salse",
                        fill: false,
                        backgroundColor: "rgba(235, 22, 22, .7)",
                        data: res.sales
                    }]
                },
                options: {
                    responsive: true
                }
            });
        })
    })
   
}