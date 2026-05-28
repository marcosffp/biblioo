arcos@MacBook-Air-de-Marcos back % cd performance-tests 
marcos@MacBook-Air-de-Marcos performance-tests % cd DomainBook 
marcos@MacBook-Air-de-Marcos DomainBook % cd book 
marcos@MacBook-Air-de-Marcos book % k6 run books-load.js
zsh: command not found: k6
marcos@MacBook-Air-de-Marcos book % k6 run books-load.js

         /\      Grafana   /‾‾/  
    /\  /  \     |\  __   /  /   
   /  \/    \    | |/ /  /   ‾‾\ 
  /          \   |   (  |  (‾)  |
 / __________ \  |_|\_\  \_____/ 


     execution: local
        script: books-load.js
        output: -

     scenarios: (100.00%) 2 scenarios, 100 max VUs, 2m30s max duration (incl. graceful stop):
              * details: 20 looping VUs for 2m0s (exec: getBookDetail, gracefulStop: 30s)
              * search: 80 looping VUs for 2m0s (exec: searchBooks, gracefulStop: 30s)



  █ THRESHOLDS 

    http_req_duration
    ✓ 'p(95)<1500' p(95)=32.51ms

      {scenario:details}
      ✓ 'p(95)<800' p(95)=12.34ms

      {scenario:search}
      ✓ 'p(95)<2000' p(95)=35.02ms

    http_req_failed
    ✓ 'rate<0.01' rate=0.00%

    http_req_waiting
    ✓ 'p(95)<1200' p(95)=32.4ms


  █ TOTAL RESULTS 

    checks_total.......: 23514   194.572986/s
    checks_succeeded...: 100.00% 23514 out of 23514
    checks_failed......: 0.00%   0 out of 23514

    ✓ status 200 ou 404
    ✓ status 200
    ✓ body é array JSON

    HTTP
    http_req_duration..............: avg=20.13ms  min=836µs    med=12.13ms max=3.68s   p(90)=28.23ms p(95)=32.51ms
      { expected_response:true }...: avg=20.13ms  min=836µs    med=12.13ms max=3.68s   p(90)=28.23ms p(95)=32.51ms
      { scenario:details }.........: avg=6.66ms   min=836µs    med=6.2ms   max=65.83ms p(90)=9.32ms  p(95)=12.34ms
      { scenario:search }..........: avg=26.94ms  min=863µs    med=17.64ms max=3.68s   p(90)=30.57ms p(95)=35.02ms
    http_req_failed................: 0.00%  0 out of 14127
    http_reqs......................: 14127  116.897702/s

    EXECUTION
    iteration_duration.............: avg=853.81ms min=500.91ms med=1.01s   max=4.69s   p(90)=1.02s   p(95)=1.03s  
    iterations.....................: 14127  116.897702/s
    vus............................: 100    min=100        max=100
    vus_max........................: 100    min=100        max=100

    NETWORK
    data_received..................: 168 MB 1.4 MB/s
    data_sent......................: 1.3 MB 11 kB/s




running (2m00.8s), 000/100 VUs, 14127 complete and 0 interrupted iterations
details ✓ [======================================] 20 VUs  2m0s
search  ✓ [======================================] 80 VUs  2m0s
marcos@MacBook-Air-de-Marcos book % k6 run books-spike.js

         /\      Grafana   /‾‾/  
    /\  /  \     |\  __   /  /   
   /  \/    \    | |/ /  /   ‾‾\ 
  /          \   |   (  |  (‾)  |
 / __________ \  |_|\_\  \_____/ 


     execution: local
        script: books-spike.js
        output: -

     scenarios: (100.00%) 1 scenario, 300 max VUs, 1m20s max duration (incl. graceful stop):
              * default: Up to 300 looping VUs for 50s over 5 stages (gracefulRampDown: 30s, gracefulStop: 30s)



  █ THRESHOLDS 

    http_req_duration
    ✓ 'p(95)<1000' p(95)=8.42ms

    http_req_failed
    ✓ 'rate<0.05' rate=0.00%


  █ TOTAL RESULTS 

    checks_total.......: 49326   977.410398/s
    checks_succeeded...: 100.00% 49326 out of 49326
    checks_failed......: 0.00%   0 out of 49326

    ✓ search status 200
    ✓ search body array
    ✓ detail status 200 ou 404

    HTTP
    http_req_duration..............: avg=3.1ms    min=454µs    med=2.19ms   max=56.84ms p(90)=6.34ms   p(95)=8.42ms  
      { expected_response:true }...: avg=3.1ms    min=454µs    med=2.19ms   max=56.84ms p(90)=6.34ms   p(95)=8.42ms  
    http_req_failed................: 0.00%  0 out of 32884
    http_reqs......................: 32884  651.606932/s

    EXECUTION
    iteration_duration.............: avg=506.78ms min=501.63ms med=505.71ms max=560ms   p(90)=511.16ms p(95)=513.77ms
    iterations.....................: 16442  325.803466/s
    vus............................: 2      min=2          max=300
    vus_max........................: 300    min=300        max=300

    NETWORK
    data_received..................: 306 MB 6.1 MB/s
    data_sent......................: 3.0 MB 59 kB/s




running (0m50.5s), 000/300 VUs, 16442 complete and 0 interrupted iterations
default ✓ [======================================] 000/300 VUs  50s
marcos@MacBook-Air-de-Marcos book % k6 run books-stress.js

         /\      Grafana   /‾‾/  
    /\  /  \     |\  __   /  /   
   /  \/    \    | |/ /  /   ‾‾\ 
  /          \   |   (  |  (‾)  |
 / __________ \  |_|\_\  \_____/ 


     execution: local
        script: books-stress.js
        output: -

     scenarios: (100.00%) 1 scenario, 400 max VUs, 4m0s max duration (incl. graceful stop):
              * default: Up to 400 looping VUs for 3m30s over 7 stages (gracefulRampDown: 30s, gracefulStop: 30s)



  █ THRESHOLDS 

    http_req_duration
    ✓ 'p(95)<1000' p(95)=18.6ms

    http_req_failed
    ✓ 'rate<0.05' rate=0.00%


  █ TOTAL RESULTS 

    checks_total.......: 188100  894.582426/s
    checks_succeeded...: 100.00% 188100 out of 188100
    checks_failed......: 0.00%   0 out of 188100

    ✓ search status 200
    ✓ search body array
    ✓ detail status 200 ou 404

    HTTP
    http_req_duration..............: avg=5.83ms   min=464µs    med=3.71ms   max=79.94ms  p(90)=13.02ms  p(95)=18.6ms  
      { expected_response:true }...: avg=5.83ms   min=464µs    med=3.71ms   max=79.94ms  p(90)=13.02ms  p(95)=18.6ms  
    http_req_failed................: 0.00%  0 out of 125400
    http_reqs......................: 125400 596.388284/s

    EXECUTION
    iteration_duration.............: avg=512.59ms min=501.52ms med=509.86ms max=588.26ms p(90)=524.57ms p(95)=530.64ms
    iterations.....................: 62700  298.194142/s
    vus............................: 4      min=1           max=399
    vus_max........................: 400    min=400         max=400

    NETWORK
    data_received..................: 1.2 GB 5.6 MB/s
    data_sent......................: 11 MB  54 kB/s




running (3m30.3s), 000/400 VUs, 62700 complete and 0 interrupted iterations
default ✓ [======================================] 000/400 VUs  3m30s
marcos@MacBook-Air-de-Marcos book % 











marcos@MacBook-Air-de-Marcos back % cd performance-tests 
marcos@MacBook-Air-de-Marcos performance-tests % cd DomainBook              
marcos@MacBook-Air-de-Marcos DomainBook % cd collection 
marcos@MacBook-Air-de-Marcos collection % k6 run collection-load.js

         /\      Grafana   /‾‾/  
    /\  /  \     |\  __   /  /   
   /  \/    \    | |/ /  /   ‾‾\ 
  /          \   |   (  |  (‾)  |
 / __________ \  |_|\_\  \_____/ 


     execution: local
        script: collection-load.js
        output: -

     scenarios: (100.00%) 2 scenarios, 210 max VUs, 2m30s max duration (incl. graceful stop):
              * crud: 150 looping VUs for 2m0s (exec: crudCollections, gracefulStop: 30s)
              * listing: 60 looping VUs for 2m0s (exec: listCollections, gracefulStop: 30s)

WARN[0049] The test has generated metrics with 100518 unique time series, which is higher than the suggested limit of 100000 and could cause high memory usage. Consider not using high-cardinality values like unique IDs as metric tags or, if you need them in the URL, use the name metric tag or URL grouping. See https://grafana.com/docs/k6/latest/using-k6/tags-and-groups/ for details.  component=metrics-engine-ingester
WARN[0087] The test has generated metrics with 200256 unique time series, which is higher than the suggested limit of 100000 and could cause high memory usage. Consider not using high-cardinality values like unique IDs as metric tags or, if you need them in the URL, use the name metric tag or URL grouping. See https://grafana.com/docs/k6/latest/using-k6/tags-and-groups/ for details.  component=metrics-engine-ingester


  █ THRESHOLDS 

    http_req_duration
    ✓ 'p(95)<1000' p(95)=22.29ms

      {scenario:crud}
      ✓ 'p(95)<1500' p(95)=22.92ms

      {scenario:listing}
      ✓ 'p(95)<1500' p(95)=19.2ms

    http_req_failed
    ✓ 'rate<0.01' rate=0.00%


  █ TOTAL RESULTS 

    checks_total.......: 78244   590.353215/s
    checks_succeeded...: 100.00% 78244 out of 78244
    checks_failed......: 0.00%   0 out of 78244

    ✓ register 201
    ✓ login 200
    ✓ setup shelf 201
    ✓ create 201
    ✓ create retorna id
    ✓ list 200
    ✓ list é array JSON
    ✓ get collection 200
    ✓ add shelf 200
    ✓ remove shelf 200
    ✓ update 200
    ✓ delete 204

    HTTP
    http_req_duration..............: avg=12.13ms min=2.71ms   med=10.28ms  max=215.45ms p(90)=17.96ms p(95)=22.29ms
      { expected_response:true }...: avg=12.13ms min=2.71ms   med=10.28ms  max=215.45ms p(90)=17.96ms p(95)=22.29ms
      { scenario:crud }............: avg=12.41ms min=2.76ms   med=10.7ms   max=215.45ms p(90)=18.15ms p(95)=22.92ms
      { scenario:listing }.........: avg=11.07ms min=2.71ms   med=9.53ms   max=203.22ms p(90)=15.58ms p(95)=19.2ms 
    http_req_failed................: 0.00% 0 out of 57092
    http_reqs......................: 57092 430.760771/s

    EXECUTION
    iteration_duration.............: avg=1.19s   min=502.93ms med=512.01ms max=2.94s    p(90)=2.57s   p(95)=2.58s  
    iterations.....................: 21152 159.592444/s
    vus............................: 150   min=0          max=210
    vus_max........................: 210   min=210        max=210

    NETWORK
    data_received..................: 28 MB 214 kB/s
    data_sent......................: 25 MB 186 kB/s




running (2m12.5s), 000/210 VUs, 21152 complete and 0 interrupted iterations
crud    ✓ [======================================] 150 VUs  2m0s
listing ✓ [======================================] 60 VUs   2m0s
marcos@MacBook-Air-de-Marcos collection % k6 run collection-spike.js

         /\      Grafana   /‾‾/  
    /\  /  \     |\  __   /  /   
   /  \/    \    | |/ /  /   ‾‾\ 
  /          \   |   (  |  (‾)  |
 / __________ \  |_|\_\  \_____/ 


     execution: local
        script: collection-spike.js
        output: -

     scenarios: (100.00%) 1 scenario, 500 max VUs, 1m20s max duration (incl. graceful stop):
              * default: Up to 500 looping VUs for 50s over 5 stages (gracefulRampDown: 30s, gracefulStop: 30s)

WARN[0050] The test has generated metrics with 100659 unique time series, which is higher than the suggested limit of 100000 and could cause high memory usage. Consider not using high-cardinality values like unique IDs as metric tags or, if you need them in the URL, use the name metric tag or URL grouping. See https://grafana.com/docs/k6/latest/using-k6/tags-and-groups/ for details.  component=metrics-engine-ingester


  █ THRESHOLDS 

    http_req_duration
    ✓ 'p(95)<2500' p(95)=241.76ms

    http_req_failed
    ✓ 'rate<0.05' rate=0.00%


  █ TOTAL RESULTS 

    checks_total.......: 41120   548.27147/s
    checks_succeeded...: 100.00% 41120 out of 41120
    checks_failed......: 0.00%   0 out of 41120

    ✓ list 200
    ✓ list array
    ✓ create 201 ou 429
    ✓ add shelf 200 ou 429

    HTTP
    http_req_duration..............: avg=60.28ms min=2.73ms med=34.27ms max=614.53ms p(90)=146.74ms p(95)=241.76ms
      { expected_response:true }...: avg=60.28ms min=2.73ms med=34.27ms max=614.53ms p(90)=146.74ms p(95)=241.76ms
    http_req_failed................: 0.00% 0 out of 42620
    http_reqs......................: 42620 568.271645/s

    EXECUTION
    iteration_duration.............: avg=1.34s   min=1.11s  med=1.33s   max=1.88s    p(90)=1.55s    p(95)=1.61s   
    iterations.....................: 10280 137.067867/s
    vus............................: 1     min=0          max=500
    vus_max........................: 500   min=500        max=500

    NETWORK
    data_received..................: 20 MB 267 kB/s
    data_sent......................: 19 MB 249 kB/s




running (1m15.0s), 000/500 VUs, 10280 complete and 0 interrupted iterations
default ✓ [======================================] 000/500 VUs  50s
marcos@MacBook-Air-de-Marcos collection % k6 run collection-stress.js

         /\      Grafana   /‾‾/  
    /\  /  \     |\  __   /  /   
   /  \/    \    | |/ /  /   ‾‾\ 
  /          \   |   (  |  (‾)  |
 / __________ \  |_|\_\  \_____/ 


     execution: local
        script: collection-stress.js
        output: -

     scenarios: (100.00%) 1 scenario, 600 max VUs, 4m30s max duration (incl. graceful stop):
              * default: Up to 600 looping VUs for 4m0s over 8 stages (gracefulRampDown: 30s, gracefulStop: 30s)

WARN[0131] The test has generated metrics with 100141 unique time series, which is higher than the suggested limit of 100000 and could cause high memory usage. Consider not using high-cardinality values like unique IDs as metric tags or, if you need them in the URL, use the name metric tag or URL grouping. See https://grafana.com/docs/k6/latest/using-k6/tags-and-groups/ for details.  component=metrics-engine-ingester
WARN[0157] The test has generated metrics with 200257 unique time series, which is higher than the suggested limit of 100000 and could cause high memory usage. Consider not using high-cardinality values like unique IDs as metric tags or, if you need them in the URL, use the name metric tag or URL grouping. See https://grafana.com/docs/k6/latest/using-k6/tags-and-groups/ for details.  component=metrics-engine-ingester
WARN[0191] The test has generated metrics with 400138 unique time series, which is higher than the suggested limit of 100000 and could cause high memory usage. Consider not using high-cardinality values like unique IDs as metric tags or, if you need them in the URL, use the name metric tag or URL grouping. See https://grafana.com/docs/k6/latest/using-k6/tags-and-groups/ for details.  component=metrics-engine-ingester
WARN[0246] The test has generated metrics with 800053 unique time series, which is higher than the suggested limit of 100000 and could cause high memory usage. Consider not using high-cardinality values like unique IDs as metric tags or, if you need them in the URL, use the name metric tag or URL grouping. See https://grafana.com/docs/k6/latest/using-k6/tags-and-groups/ for details.  component=metrics-engine-ingester


  █ THRESHOLDS 

    http_req_duration
    ✓ 'p(95)<2500' p(95)=309.26ms

    http_req_failed
    ✓ 'rate<0.05' rate=0.00%


  █ TOTAL RESULTS 

    checks_total.......: 173760  620.945886/s
    checks_succeeded...: 100.00% 173760 out of 173760
    checks_failed......: 0.00%   0 out of 173760

    ✓ list 200
    ✓ list array
    ✓ create 201
    ✓ get 200
    ✓ add shelf 200
    ✓ remove shelf 200
    ✓ update 200
    ✓ delete 204

    HTTP
    http_req_duration..............: avg=89.63ms min=2.72ms med=30.16ms max=1.81s p(90)=225.17ms p(95)=309.26ms
      { expected_response:true }...: avg=89.63ms min=2.72ms med=30.16ms max=1.81s p(90)=225.17ms p(95)=309.26ms
    http_req_failed................: 0.00%  0 out of 154440
    http_reqs......................: 154440 551.90425/s

    EXECUTION
    iteration_duration.............: avg=2.33s   min=1.73s  med=2.05s   max=5.53s p(90)=3.38s    p(95)=3.76s   
    iterations.....................: 21720  77.618236/s
    vus............................: 7      min=0           max=600
    vus_max........................: 600    min=600         max=600

    NETWORK
    data_received..................: 79 MB  281 kB/s
    data_sent......................: 70 MB  249 kB/s




running (4m39.8s), 000/600 VUs, 21720 complete and 0 interrupted iterations
default ✓ [======================================] 000/600 VUs  4m0s
marcos@MacBook-Air-de-Marcos collection % 



arcos@MacBook-Air-de-Marcos back % cd performance-tests 
marcos@MacBook-Air-de-Marcos performance-tests % cd DomainBook 
marcos@MacBook-Air-de-Marcos DomainBook % cd shelf      
marcos@MacBook-Air-de-Marcos shelf % k6 run shelf-load.js

         /\      Grafana   /‾‾/  
    /\  /  \     |\  __   /  /   
   /  \/    \    | |/ /  /   ‾‾\ 
  /          \   |   (  |  (‾)  |
 / __________ \  |_|\_\  \_____/ 


     execution: local
        script: shelf-load.js
        output: -

     scenarios: (100.00%) 2 scenarios, 210 max VUs, 2m30s max duration (incl. graceful stop):
              * crud: 150 looping VUs for 2m0s (exec: crudShelves, gracefulStop: 30s)
              * listing: 60 looping VUs for 2m0s (exec: listShelves, gracefulStop: 30s)

WARN[0058] The test has generated metrics with 100389 unique time series, which is higher than the suggested limit of 100000 and could cause high memory usage. Consider not using high-cardinality values like unique IDs as metric tags or, if you need them in the URL, use the name metric tag or URL grouping. See https://grafana.com/docs/k6/latest/using-k6/tags-and-groups/ for details.  component=metrics-engine-ingester
WARN[0107] The test has generated metrics with 200334 unique time series, which is higher than the suggested limit of 100000 and could cause high memory usage. Consider not using high-cardinality values like unique IDs as metric tags or, if you need them in the URL, use the name metric tag or URL grouping. See https://grafana.com/docs/k6/latest/using-k6/tags-and-groups/ for details.  component=metrics-engine-ingester


  █ THRESHOLDS 

    http_req_duration
    ✓ 'p(95)<1000' p(95)=44.66ms

      {scenario:crud}
      ✓ 'p(95)<1500' p(95)=48.37ms

      {scenario:listing}
      ✓ 'p(95)<1500' p(95)=33.71ms

    http_req_failed
    ✓ 'rate<0.01' rate=0.00%


  █ TOTAL RESULTS 

    checks_total.......: 74300   567.561753/s
    checks_succeeded...: 100.00% 74300 out of 74300
    checks_failed......: 0.00%   0 out of 74300

    ✓ register 201
    ✓ login 200
    ✓ create 201
    ✓ create retorna id
    ✓ list 200
    ✓ list é array JSON
    ✓ get shelf 200
    ✓ update 200
    ✓ delete 204

    HTTP
    http_req_duration..............: avg=17.38ms min=2.48ms   med=12.7ms   max=139.29ms p(90)=32.11ms p(95)=44.66ms
      { expected_response:true }...: avg=17.38ms min=2.48ms   med=12.7ms   max=139.29ms p(90)=32.11ms p(95)=44.66ms
      { scenario:crud }............: avg=18.7ms  min=2.62ms   med=13.73ms  max=139.29ms p(90)=34.79ms p(95)=48.37ms
      { scenario:listing }.........: avg=13.79ms min=2.48ms   med=10.35ms  max=114.18ms p(90)=24.68ms p(95)=33.71ms
    http_req_failed................: 0.00% 0 out of 51105
    http_reqs......................: 51105 390.380126/s

    EXECUTION
    iteration_duration.............: avg=1.09s   min=502.63ms med=519.24ms max=2.15s    p(90)=1.98s   p(95)=2s     
    iterations.....................: 23195 177.181627/s
    vus............................: 210   min=0          max=210
    vus_max........................: 210   min=210        max=210

    NETWORK
    data_received..................: 23 MB 175 kB/s
    data_sent......................: 21 MB 163 kB/s




running (2m10.9s), 000/210 VUs, 23195 complete and 0 interrupted iterations
crud    ✓ [======================================] 150 VUs  2m0s
listing ✓ [======================================] 60 VUs   2m0s
marcos@MacBook-Air-de-Marcos shelf % k6 run shelf-spike.js

         /\      Grafana   /‾‾/  
    /\  /  \     |\  __   /  /   
   /  \/    \    | |/ /  /   ‾‾\ 
  /          \   |   (  |  (‾)  |
 / __________ \  |_|\_\  \_____/ 


     execution: local
        script: shelf-spike.js
        output: -

     scenarios: (100.00%) 1 scenario, 500 max VUs, 1m20s max duration (incl. graceful stop):
              * default: Up to 500 looping VUs for 50s over 5 stages (gracefulRampDown: 30s, gracefulStop: 30s)

WARN[0051] The test has generated metrics with 100307 unique time series, which is higher than the suggested limit of 100000 and could cause high memory usage. Consider not using high-cardinality values like unique IDs as metric tags or, if you need them in the URL, use the name metric tag or URL grouping. See https://grafana.com/docs/k6/latest/using-k6/tags-and-groups/ for details.  component=metrics-engine-ingester


  █ THRESHOLDS 

    http_req_duration
    ✓ 'p(95)<2500' p(95)=76.67ms

    http_req_failed
    ✓ 'rate<0.05' rate=0.00%


  █ TOTAL RESULTS 

    checks_total.......: 51186   702.845154/s
    checks_succeeded...: 100.00% 51186 out of 51186
    checks_failed......: 0.00%   0 out of 51186

    ✓ list 200
    ✓ list array
    ✓ create 201 ou 429

    HTTP
    http_req_duration..............: avg=34.74ms  min=2.4ms    med=30.32ms  max=202.12ms p(90)=65.92ms  p(95)=76.67ms 
      { expected_response:true }...: avg=34.74ms  min=2.4ms    med=30.32ms  max=202.12ms p(90)=65.92ms  p(95)=76.67ms 
    http_req_failed................: 0.00% 0 out of 52186
    http_reqs......................: 52186 716.576353/s

    EXECUTION
    iteration_duration.............: avg=805.35ms min=708.62ms med=801.76ms max=1.06s    p(90)=886.73ms p(95)=910.71ms
    iterations.....................: 17062 234.281718/s
    vus............................: 7     min=0          max=500
    vus_max........................: 500   min=500        max=500

    NETWORK
    data_received..................: 22 MB 301 kB/s
    data_sent......................: 22 MB 299 kB/s




running (1m12.8s), 000/500 VUs, 17062 complete and 0 interrupted iterations
default ✓ [======================================] 000/500 VUs  50s
marcos@MacBook-Air-de-Marcos shelf % k6 run shelf-stress.js

         /\      Grafana   /‾‾/  
    /\  /  \     |\  __   /  /   
   /  \/    \    | |/ /  /   ‾‾\ 
  /          \   |   (  |  (‾)  |
 / __________ \  |_|\_\  \_____/ 


     execution: local
        script: shelf-stress.js
        output: -

     scenarios: (100.00%) 1 scenario, 600 max VUs, 4m30s max duration (incl. graceful stop):
              * default: Up to 600 looping VUs for 4m0s over 8 stages (gracefulRampDown: 30s, gracefulStop: 30s)

WARN[0147] The test has generated metrics with 100120 unique time series, which is higher than the suggested limit of 100000 and could cause high memory usage. Consider not using high-cardinality values like unique IDs as metric tags or, if you need them in the URL, use the name metric tag or URL grouping. See https://grafana.com/docs/k6/latest/using-k6/tags-and-groups/ for details.  component=metrics-engine-ingester
WARN[0176] The test has generated metrics with 200416 unique time series, which is higher than the suggested limit of 100000 and could cause high memory usage. Consider not using high-cardinality values like unique IDs as metric tags or, if you need them in the URL, use the name metric tag or URL grouping. See https://grafana.com/docs/k6/latest/using-k6/tags-and-groups/ for details.  component=metrics-engine-ingester
WARN[0215] The test has generated metrics with 400369 unique time series, which is higher than the suggested limit of 100000 and could cause high memory usage. Consider not using high-cardinality values like unique IDs as metric tags or, if you need them in the URL, use the name metric tag or URL grouping. See https://grafana.com/docs/k6/latest/using-k6/tags-and-groups/ for details.  component=metrics-engine-ingester


  █ THRESHOLDS 

    http_req_duration
    ✓ 'p(95)<2500' p(95)=138.75ms

    http_req_failed
    ✓ 'rate<0.05' rate=0.00%


  █ TOTAL RESULTS 

    checks_total.......: 201150  725.428181/s
    checks_succeeded...: 100.00% 201150 out of 201150
    checks_failed......: 0.00%   0 out of 201150

    ✓ list 200
    ✓ list array
    ✓ create 201
    ✓ get 200
    ✓ delete 204

    HTTP
    http_req_duration..............: avg=37.92ms min=2.44ms med=14.46ms max=516.23ms p(90)=107.69ms p(95)=138.75ms
      { expected_response:true }...: avg=37.92ms min=2.44ms med=14.46ms max=516.23ms p(90)=107.69ms p(95)=138.75ms
    http_req_failed................: 0.00%  0 out of 162520
    http_reqs......................: 162520 586.112792/s

    EXECUTION
    iteration_duration.............: avg=1.25s   min=1.11s  med=1.16s   max=2.03s    p(90)=1.53s    p(95)=1.62s   
    iterations.....................: 40230  145.085636/s
    vus............................: 3      min=0           max=598
    vus_max........................: 600    min=600         max=600

    NETWORK
    data_received..................: 71 MB  256 kB/s
    data_sent......................: 68 MB  245 kB/s


marcos@MacBook-Air-de-Marcos back % cd performance-tests 
marcos@MacBook-Air-de-Marcos performance-tests % cd DomainBook 
marcos@MacBook-Air-de-Marcos DomainBook % cd shelfItem  
marcos@MacBook-Air-de-Marcos shelfItem % k6 run shelfItem-load.js

         /\      Grafana   /‾‾/  
    /\  /  \     |\  __   /  /   
   /  \/    \    | |/ /  /   ‾‾\ 
  /          \   |   (  |  (‾)  |
 / __________ \  |_|\_\  \_____/ 


     execution: local
        script: shelfItem-load.js
        output: -

     scenarios: (100.00%) 2 scenarios, 210 max VUs, 2m30s max duration (incl. graceful stop):
              * crud: 150 looping VUs for 2m0s (exec: crudShelfItems, gracefulStop: 30s)
              * listing: 60 looping VUs for 2m0s (exec: listShelfItems, gracefulStop: 30s)



  █ THRESHOLDS 

    http_req_duration
    ✓ 'p(95)<1000' p(95)=27.75ms

      {scenario:crud}
      ✓ 'p(95)<1500' p(95)=30.14ms

      {scenario:listing}
      ✓ 'p(95)<1500' p(95)=13.79ms

    http_req_failed
    ✓ 'rate<0.01' rate=0.00%


  █ TOTAL RESULTS 

    checks_total.......: 76830   580.957695/s
    checks_succeeded...: 100.00% 76830 out of 76830
    checks_failed......: 0.00%   0 out of 76830

    ✓ register 201
    ✓ login 200
    ✓ setup shelf 201
    ✓ list items 200
    ✓ list é array JSON
    ✓ add item 201
    ✓ add item retorna id
    ✓ get item 200
    ✓ update progress 200
    ✓ change status 200
    ✓ remove item 204

    HTTP
    http_req_duration..............: avg=14.22ms min=1.69ms   med=13.21ms  max=237.42ms p(90)=22.68ms p(95)=27.75ms
      { expected_response:true }...: avg=14.22ms min=1.69ms   med=13.21ms  max=237.42ms p(90)=22.68ms p(95)=27.75ms
      { scenario:crud }............: avg=16.57ms min=3.29ms   med=15.24ms  max=237.42ms p(90)=24.38ms p(95)=30.14ms
      { scenario:listing }.........: avg=7.6ms   min=1.69ms   med=6.19ms   max=225.08ms p(90)=10.33ms p(95)=13.79ms
    http_req_failed................: 0.00% 0 out of 54660
    http_reqs......................: 54660 413.317032/s

    EXECUTION
    iteration_duration.............: avg=1.14s   min=502.09ms med=508.22ms max=2.6s     p(90)=2.29s   p(95)=2.3s   
    iterations.....................: 22170 167.640662/s
    vus............................: 51    min=0          max=210
    vus_max........................: 210   min=210        max=210

    NETWORK
    data_received..................: 27 MB 206 kB/s
    data_sent......................: 24 MB 178 kB/s




running (2m12.2s), 000/210 VUs, 22170 complete and 0 interrupted iterations
crud    ✓ [======================================] 150 VUs  2m0s
listing ✓ [======================================] 60 VUs   2m0s
marcos@MacBook-Air-de-Marcos shelfItem % k6 run shelfItem-spike.js

         /\      Grafana   /‾‾/  
    /\  /  \     |\  __   /  /   
   /  \/    \    | |/ /  /   ‾‾\ 
  /          \   |   (  |  (‾)  |
 / __________ \  |_|\_\  \_____/ 


     execution: local
        script: shelfItem-spike.js
        output: -

     scenarios: (100.00%) 1 scenario, 500 max VUs, 1m20s max duration (incl. graceful stop):
              * default: Up to 500 looping VUs for 50s over 5 stages (gracefulRampDown: 30s, gracefulStop: 30s)



  █ THRESHOLDS 

    http_req_duration
    ✓ 'p(95)<2500' p(95)=238.08ms

    http_req_failed
    ✓ 'rate<0.05' rate=0.00%


  █ TOTAL RESULTS 

    checks_total.......: 34420   410.955697/s
    checks_succeeded...: 100.00% 34420 out of 34420
    checks_failed......: 0.00%   0 out of 34420

    ✓ list items 200
    ✓ list array
    ✓ add item 201 ou 429
    ✓ update progress 200 ou 429

    HTTP
    http_req_duration..............: avg=123.48ms min=3.23ms med=145.51ms max=530.21ms p(90)=203.87ms p(95)=238.08ms
      { expected_response:true }...: avg=123.48ms min=3.23ms med=145.51ms max=530.21ms p(90)=203.87ms p(95)=238.08ms
    http_req_failed................: 0.00% 0 out of 35920
    http_reqs......................: 35920 428.864864/s

    EXECUTION
    iteration_duration.............: avg=1.61s    min=1.12s  med=1.7s     max=2.25s    p(90)=1.86s    p(95)=1.91s   
    iterations.....................: 8605  102.738924/s
    vus............................: 3     min=0          max=500
    vus_max........................: 500   min=500        max=500

    NETWORK
    data_received..................: 18 MB 210 kB/s
    data_sent......................: 16 MB 189 kB/s




running (1m23.8s), 000/500 VUs, 8605 complete and 0 interrupted iterations
default ✓ [======================================] 000/500 VUs  50s
marcos@MacBook-Air-de-Marcos shelfItem % k6 run shelfItem-stress.js

         /\      Grafana   /‾‾/  
    /\  /  \     |\  __   /  /   
   /  \/    \    | |/ /  /   ‾‾\ 
  /          \   |   (  |  (‾)  |
 / __________ \  |_|\_\  \_____/ 


     execution: local
        script: shelfItem-stress.js
        output: -

     scenarios: (100.00%) 1 scenario, 600 max VUs, 4m30s max duration (incl. graceful stop):
              * default: Up to 600 looping VUs for 4m0s over 8 stages (gracefulRampDown: 30s, gracefulStop: 30s)



  █ THRESHOLDS 

    http_req_duration
    ✓ 'p(95)<3000' p(95)=337.32ms

    http_req_failed
    ✓ 'rate<0.05' rate=0.00%


  █ TOTAL RESULTS 

    checks_total.......: 159481  567.303291/s
    checks_succeeded...: 100.00% 159481 out of 159481
    checks_failed......: 0.00%   0 out of 159481

    ✓ list items 200
    ✓ list array
    ✓ add item 201
    ✓ get item 200
    ✓ update progress 200
    ✓ change status 200
    ✓ remove item 204

    HTTP
    http_req_duration..............: avg=118.65ms min=1.94ms med=76.09ms max=1.24s p(90)=287.64ms p(95)=337.32ms
      { expected_response:true }...: avg=118.65ms min=1.94ms med=76.09ms max=1.24s p(90)=287.64ms p(95)=337.32ms
    http_req_failed................: 0.00%  0 out of 139098
    http_reqs......................: 139098 494.797205/s

    EXECUTION
    iteration_duration.............: avg=2.22s    min=1.53s  med=2.02s   max=4.98s p(90)=3.11s    p(95)=3.38s   
    iterations.....................: 22783  81.043327/s
    vus............................: 1      min=0           max=600
    vus_max........................: 600    min=600         max=600

    NETWORK
    data_received..................: 72 MB  255 kB/s
    data_sent......................: 62 MB  221 kB/s




running (4m41.1s), 000/600 VUs, 22783 complete and 0 interrupted iterations
default ✓ [======================================] 000/600 VUs  4m0s
marcos@MacBook-Air-de-Marcos shelfItem % 



running (4m37.3s), 000/600 VUs, 40230 complete and 0 interrupted iterations
default ✓ [======================================] 000/600 VUs  4m0s
marcos@MacBook-Air-de-Marcos shelf % 