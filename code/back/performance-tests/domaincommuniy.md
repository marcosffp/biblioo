marcos@MacBook-Air-de-Marcos back % cd performance-tests 
marcos@MacBook-Air-de-Marcos performance-tests % cd DomainCommunity 
marcos@MacBook-Air-de-Marcos DomainCommunity % CD community 
marcos@MacBook-Air-de-Marcos DomainCommunity % k6 run community-load.js        
ERRO[0000] The moduleSpecifier "community-load.js" couldn't be found on local disk. Make sure that you've specified the right path to the file. If you're running k6 using the Docker image make sure you have mounted the local directory (-v /local/path/:/inside/docker/path) containing your script and modules so that they're accessible by k6 from inside of the container, see https://grafana.com/docs/k6/latest/using-k6/modules/#use-modules-with-docker. 
marcos@MacBook-Air-de-Marcos DomainCommunity % cd community 
marcos@MacBook-Air-de-Marcos community % k6 run community-load.js

         /\      Grafana   /‾‾/  
    /\  /  \     |\  __   /  /   
   /  \/    \    | |/ /  /   ‾‾\ 
  /          \   |   (  |  (‾)  |
 / __________ \  |_|\_\  \_____/ 


     execution: local
        script: community-load.js
        output: -

     scenarios: (100.00%) 4 scenarios, 90 max VUs, 2m30s max duration (incl. graceful stop):
              * leaveJoin: 15 looping VUs for 2m0s (exec: leaveAndJoin, gracefulStop: 30s)
              * manage: 15 looping VUs for 2m0s (exec: manageCommunities, gracefulStop: 30s)
              * members: 20 looping VUs for 2m0s (exec: membersAndDiscovery, gracefulStop: 30s)
              * read: 40 looping VUs for 2m0s (exec: readCommunities, gracefulStop: 30s)



  █ THRESHOLDS 

    http_req_duration
    ✓ 'p(95)<1000' p(95)=15.43ms

      {scenario:leaveJoin}
      ✓ 'p(95)<1500' p(95)=20.54ms

      {scenario:manage}
      ✓ 'p(95)<2000' p(95)=14.45ms

      {scenario:members}
      ✓ 'p(95)<800' p(95)=13.64ms

      {scenario:read}
      ✓ 'p(95)<500' p(95)=11.51ms

    http_req_failed
    ✓ 'rate<0.01' rate=0.00%


  █ TOTAL RESULTS 

    checks_total.......: 26252   199.636461/s
    checks_succeeded...: 100.00% 26252 out of 26252
    checks_failed......: 0.00%   0 out of 26252

    ✓ owner register 201
    ✓ owner login 200
    ✓ create community 201
    ✓ register 201
    ✓ login 200
    ✓ join 204
    ✓ create 201
    ✓ create retorna id
    ✓ GET /communities 200
    ✓ leave 204 ou 4xx
    ✓ GET members 200
    ✓ GET community 200
    ✓ GET /communities/{id} 200
    ✓ join 204 ou 4xx
    ✓ GET /mine 200
    ✓ update 200
    ✓ GET /book/{bookId} 200
    ✓ delete 204

    HTTP
    http_req_duration..............: avg=8.85ms  min=2.1ms    med=7.4ms    max=133.8ms  p(90)=13.42ms p(95)=15.43ms
      { expected_response:true }...: avg=8.85ms  min=2.1ms    med=7.4ms    max=133.8ms  p(90)=13.42ms p(95)=15.43ms
      { scenario:leaveJoin }.......: avg=13.73ms min=5.66ms   med=12.6ms   max=108.31ms p(90)=17.65ms p(95)=20.54ms
      { scenario:manage }..........: avg=9.52ms  min=2.68ms   med=9.34ms   max=100.92ms p(90)=12.75ms p(95)=14.45ms
      { scenario:members }.........: avg=8.35ms  min=2.95ms   med=6.89ms   max=107.42ms p(90)=12.14ms p(95)=13.64ms
      { scenario:read }............: avg=7.35ms  min=2.1ms    med=6.53ms   max=99.44ms  p(90)=10.03ms p(95)=11.51ms
    http_req_failed................: 0.00%  0 out of 25322
    http_reqs......................: 25322  192.564165/s

    EXECUTION
    iteration_duration.............: avg=1.04s   min=806.98ms med=819.24ms max=2.05s    p(90)=1.33s   p(95)=1.93s  
    iterations.....................: 10355  78.745831/s
    vus............................: 68     min=0          max=90
    vus_max........................: 90     min=90         max=90

    NETWORK
    data_received..................: 37 MB  284 kB/s
    data_sent......................: 9.6 MB 73 kB/s




running (2m11.5s), 00/90 VUs, 10355 complete and 0 interrupted iterations
leaveJoin ✓ [======================================] 15 VUs  2m0s
manage    ✓ [======================================] 15 VUs  2m0s
members   ✓ [======================================] 20 VUs  2m0s
read      ✓ [======================================] 40 VUs  2m0s
marcos@MacBook-Air-de-Marcos community % ç√marcos@MacBook-Air-de-Marcos community % k6 run community-spike.js

         /\      Grafana   /‾‾/  
    /\  /  \     |\  __   /  /   
   /  \/    \    | |/ /  /   ‾‾\ 
  /          \   |   (  |  (‾)  |
 / __________ \  |_|\_\  \_____/ 


     execution: local
        script: community-spike.js
        output: -

     scenarios: (100.00%) 1 scenario, 200 max VUs, 1m20s max duration (incl. graceful stop):
              * default: Up to 200 looping VUs for 50s over 5 stages (gracefulRampDown: 30s, gracefulStop: 30s)



  █ THRESHOLDS 

    http_req_duration
    ✓ 'p(95)<2000' p(95)=13.9ms

    http_req_failed
    ✓ 'rate<0.05' rate=0.00%


  █ TOTAL RESULTS 

    checks_total.......: 13672   258.396985/s
    checks_succeeded...: 100.00% 13672 out of 13672
    checks_failed......: 0.00%   0 out of 13672

    ✓ owner register 201
    ✓ owner login 200
    ✓ create community 201
    ✓ register 201
    ✓ login 200
    ✓ GET /communities 200
    ✓ GET /communities/{id} 200

    HTTP
    http_req_duration..............: avg=7.53ms   min=2.13ms med=6.96ms   max=41.87ms  p(90)=10.99ms  p(95)=13.9ms  
      { expected_response:true }...: avg=7.53ms   min=2.13ms med=6.96ms   max=41.87ms  p(90)=10.99ms  p(95)=13.9ms  
    http_req_failed................: 0.00%  0 out of 13672
    http_reqs......................: 13672  258.396985/s

    EXECUTION
    iteration_duration.............: avg=815.78ms min=805ms  med=815.45ms max=861.06ms p(90)=822.07ms p(95)=825.88ms
    iterations.....................: 6780   128.140108/s
    vus............................: 2      min=0          max=200
    vus_max........................: 200    min=200        max=200

    NETWORK
    data_received..................: 20 MB  386 kB/s
    data_sent......................: 5.0 MB 94 kB/s




running (0m52.9s), 000/200 VUs, 6780 complete and 0 interrupted iterations
default ✓ [======================================] 000/200 VUs  50s
marcos@MacBook-Air-de-Marcos community % marcos@MacBook-Air-de-Marcos community % k6 run community-stress.js

         /\      Grafana   /‾‾/  
    /\  /  \     |\  __   /  /   
   /  \/    \    | |/ /  /   ‾‾\ 
  /          \   |   (  |  (‾)  |
 / __________ \  |_|\_\  \_____/ 


     execution: local
        script: community-stress.js
        output: -

     scenarios: (100.00%) 1 scenario, 500 max VUs, 4m0s max duration (incl. graceful stop):
              * default: Up to 500 looping VUs for 3m30s over 7 stages (gracefulRampDown: 30s, gracefulStop: 30s)



  █ THRESHOLDS 

    http_req_duration
    ✓ 'p(95)<5000' p(95)=47.95ms

    http_req_failed
    ✓ 'rate<0.1' rate=0.00%


  █ TOTAL RESULTS 

    checks_total.......: 213847  995.226133/s
    checks_succeeded...: 100.00% 213847 out of 213847
    checks_failed......: 0.00%   0 out of 213847

    ✓ owner register 201
    ✓ owner login 200
    ✓ create community 201
    ✓ register 201
    ✓ login 200
    ✓ GET /communities 200
    ✓ GET /communities/{id} 200

    HTTP
    http_req_duration..............: avg=14.23ms  min=1.87ms   med=7.99ms   max=194.3ms  p(90)=32.95ms  p(95)=47.95ms 
      { expected_response:true }...: avg=14.23ms  min=1.87ms   med=7.99ms   max=194.3ms  p(90)=32.95ms  p(95)=47.95ms 
    http_req_failed................: 0.00%  0 out of 213847
    http_reqs......................: 213847 995.226133/s

    EXECUTION
    iteration_duration.............: avg=328.81ms min=304.26ms med=318.11ms max=510.26ms p(90)=363.93ms p(95)=384.87ms
    iterations.....................: 106815 497.108117/s
    vus............................: 14     min=0           max=497
    vus_max........................: 500    min=500         max=500

    NETWORK
    data_received..................: 321 MB 1.5 MB/s
    data_sent......................: 79 MB  365 kB/s




running (3m34.9s), 000/500 VUs, 106815 complete and 0 interrupted iterations
default ✓ [======================================] 000/500 VUs  3m30s
marcos@MacBook-Air-de-Marcos community % marcos@MacBook-Air-de-Marcos community % k6 run community-invites-load.js

         /\      Grafana   /‾‾/  
    /\  /  \     |\  __   /  /   
   /  \/    \    | |/ /  /   ‾‾\ 
  /          \   |   (  |  (‾)  |
 / __________ \  |_|\_\  \_____/ 


     execution: local
        script: community-invites-load.js
        output: -

     scenarios: (100.00%) 2 scenarios, 2 max VUs, 2m30s max duration (incl. graceful stop):
              * invite: 1 looping VUs for 2m0s (exec: inviteFlow, gracefulStop: 30s)
              * listPending: 1 looping VUs for 2m0s (exec: listPending, gracefulStop: 30s)



  █ THRESHOLDS 

    http_req_duration
    ✓ 'p(95)<1500' p(95)=27.88ms

      {scenario:invite}
      ✓ 'p(95)<2000' p(95)=32.05ms

      {scenario:listPending}
      ✓ 'p(95)<1500' p(95)=13.69ms

    http_req_failed
    ✓ 'rate<0.05' rate=0.00%


  █ TOTAL RESULTS 

    checks_total.......: 1010    7.683484/s
    checks_succeeded...: 100.00% 1010 out of 1010
    checks_failed......: 0.00%   0 out of 1010

    ✓ owner register 201
    ✓ owner login 200
    ✓ create community 201
    ✓ invitee register 201
    ✓ invitee login 200
    ✓ GET /invites/pending 200
    ✓ invite 201 ou conflito
    ✓ decline 204

    HTTP
    http_req_duration..............: avg=18.76ms min=3.55ms   med=20.51ms  max=38.39ms p(90)=25.58ms p(95)=27.88ms
      { expected_response:true }...: avg=18.76ms min=3.55ms   med=20.51ms  max=38.39ms p(90)=25.58ms p(95)=27.88ms
      { scenario:invite }..........: avg=19.27ms min=6.09ms   med=18.13ms  max=37.55ms p(90)=29.54ms p(95)=32.05ms
      { scenario:listPending }.....: avg=9.85ms  min=3.55ms   med=10.39ms  max=17.26ms p(90)=12.68ms p(95)=13.69ms
    http_req_failed................: 0.00%  0 out of 1010
    http_reqs......................: 1010   7.683484/s

    EXECUTION
    iteration_duration.............: avg=710.5ms min=504.57ms med=512.23ms max=1.17s   p(90)=1.16s   p(95)=1.16s  
    iterations.....................: 339    2.578912/s
    vus............................: 1      min=0         max=2
    vus_max........................: 2      min=2         max=2

    NETWORK
    data_received..................: 673 kB 5.1 kB/s
    data_sent......................: 322 kB 2.5 kB/s




running (2m11.5s), 0/2 VUs, 339 complete and 0 interrupted iterations
invite      ✓ [======================================] 1 VUs  2m0s
listPending ✓ [======================================] 1 VUs  2m0s√marcos@MacBook-Air-de-Marcos community % k6 run community-invites-stress.js

         /\      Grafana   /‾‾/  
    /\  /  \     |\  __   /  /   
   /  \/    \    | |/ /  /   ‾‾\ 
  /          \   |   (  |  (‾)  |
 / __________ \  |_|\_\  \_____/ 


     execution: local
        script: community-invites-stress.js
        output: -

     scenarios: (100.00%) 1 scenario, 600 max VUs, 4m30s max duration (incl. graceful stop):
              * default: Up to 600 looping VUs for 4m0s over 8 stages (gracefulRampDown: 30s, gracefulStop: 30s)

WARN[0166] The test has generated metrics with 100393 unique time series, which is higher than the suggested limit of 100000 and could cause high memory usage. Consider not using high-cardinality values like unique IDs as metric tags or, if you need them in the URL, use the name metric tag or URL grouping. See https://grafana.com/docs/k6/latest/using-k6/tags-and-groups/ for details.  component=metrics-engine-ingester
WARN[0202] The test has generated metrics with 200167 unique time series, which is higher than the suggested limit of 100000 and could cause high memory usage. Consider not using high-cardinality values like unique IDs as metric tags or, if you need them in the URL, use the name metric tag or URL grouping. See https://grafana.com/docs/k6/latest/using-k6/tags-and-groups/ for details.  component=metrics-engine-ingester
WARN[0259] The test has generated metrics with 400192 unique time series, which is higher than the suggested limit of 100000 and could cause high memory usage. Consider not using high-cardinality values like unique IDs as metric tags or, if you need them in the URL, use the name metric tag or URL grouping. See https://grafana.com/docs/k6/latest/using-k6/tags-and-groups/ for details.  component=metrics-engine-ingester


  █ THRESHOLDS 

    http_req_duration
    ✓ 'p(95)<5000' p(95)=319.35ms

    http_req_failed
    ✓ 'rate<0.3' rate=8.06%


  █ TOTAL RESULTS 

    checks_total.......: 157086  567.580771/s
    checks_succeeded...: 100.00% 157086 out of 157086
    checks_failed......: 0.00%   0 out of 157086

    ✓ owner register 201
    ✓ owner login 200
    ✓ create community 201
    ✓ invitee register 201
    ✓ invitee login 200
    ✓ invite 201 ou conflito
    ✓ GET /invites/pending 200
    ✓ decline 204 ou conflito

    HTTP
    http_req_duration..............: avg=84.33ms  min=1.94ms   med=27.99ms  max=1.19s p(90)=239.73ms p(95)=319.35ms
      { expected_response:true }...: avg=81.11ms  min=1.94ms   med=24.62ms  max=1.19s p(90)=236.54ms p(95)=321.11ms
    http_req_failed................: 8.06%  12667 out of 157086
    http_reqs......................: 157086 567.580771/s

    EXECUTION
    iteration_duration.............: avg=647.51ms min=307.38ms med=503.69ms max=2.17s p(90)=1.12s    p(95)=1.25s   
    iterations.....................: 52593  190.028236/s
    vus............................: 13     min=0               max=600
    vus_max........................: 600    min=600             max=600

    NETWORK
    data_received..................: 72 MB  261 kB/s
    data_sent......................: 65 MB  234 kB/s




running (4m36.8s), 000/600 VUs, 52593 complete and 0 interrupted iterations
default ✓ [======================================] 000/600 VUs  4m0s
marcos@MacBook-Air-de-Marcos communityarcos@MacBook-Air-de-Marcos community % k6 run community-join-requests-load.js

         /\      Grafana   /‾‾/  
    /\  /  \     |\  __   /  /   
   /  \/    \    | |/ /  /   ‾‾\ 
  /          \   |   (  |  (‾)  |
 / __________ \  |_|\_\  \_____/ 


     execution: local
        script: community-join-requests-load.js
        output: -

     scenarios: (100.00%) 2 scenarios, 210 max VUs, 2m30s max duration (incl. graceful stop):
              * listPending: 60 looping VUs for 2m0s (exec: listPending, gracefulStop: 30s)
              * request: 150 looping VUs for 2m0s (exec: requestFlow, gracefulStop: 30s)



  █ THRESHOLDS 

    http_req_duration
    ✓ 'p(95)<1500' p(95)=121.11ms

      {scenario:listPending}
      ✓ 'p(95)<800' p(95)=160.85ms

      {scenario:request}
      ✓ 'p(95)<2000' p(95)=111.25ms

    http_req_failed
    ✗ 'rate<0.05' rate=31.19%


  █ TOTAL RESULTS 

    checks_total.......: 57539  433.833915/s
    checks_succeeded...: 81.98% 47172 out of 57539
    checks_failed......: 18.01% 10367 out of 57539

    ✓ owner register 201
    ✓ owner login 200
    ✓ create community 201
    ✓ requester register 201
    ✓ requester login 200
    ✓ request 201 ou conflito
    ✓ GET /join-requests 200
    ✗ reject 204
      ↳  30% — ✓ 4483 / ✗ 10367

    HTTP
    http_req_duration..............: avg=47.76ms  min=2.02ms   med=35.03ms max=956.43ms p(90)=89.48ms  p(95)=121.11ms
      { expected_response:true }...: avg=62.88ms  min=3.62ms   med=52.53ms max=956.43ms p(90)=102.46ms p(95)=142.82ms
      { scenario:listPending }.....: avg=78.98ms  min=16.68ms  med=58.54ms max=888.33ms p(90)=111.51ms p(95)=160.85ms
      { scenario:request }.........: avg=39.33ms  min=2.02ms   med=17.45ms max=956.43ms p(90)=81.4ms   p(95)=111.25ms
    http_req_failed................: 31.19% 17952 out of 57539
    http_reqs......................: 57539  433.833915/s

    EXECUTION
    iteration_duration.............: avg=926.91ms min=516.83ms med=1.17s   max=2.13s    p(90)=1.22s    p(95)=1.26s   
    iterations.....................: 27319  205.980443/s
    vus............................: 103    min=0              max=210
    vus_max........................: 210    min=210            max=210

    NETWORK
    data_received..................: 66 MB  498 kB/s
    data_sent......................: 23 MB  175 kB/s




running (2m12.6s), 000/210 VUs, 27319 complete and 0 interrupted iterations
listPending ✓ [======================================] 60 VUs   2m0s
request     ✓ [======================================] 150 VUs  2m0s
ERRO[0133] thresholds on metrics 'http_req_failed' have been crossed 
marcos@MacBook-Air-de-Marcos community marcos@MacBook-Air-de-Marcos community % k6 run community-join-requests-stress.js

         /\      Grafana   /‾‾/  
    /\  /  \     |\  __   /  /   
   /  \/    \    | |/ /  /   ‾‾\ 
  /          \   |   (  |  (‾)  |
 / __________ \  |_|\_\  \_____/ 


     execution: local
        script: community-join-requests-stress.js
        output: -

     scenarios: (100.00%) 1 scenario, 600 max VUs, 4m30s max duration (incl. graceful stop):
              * default: Up to 600 looping VUs for 4m0s over 8 stages (gracefulRampDown: 30s, gracefulStop: 30s)

WARN[0170] The test has generated metrics with 100024 unique time series, which is higher than the suggested limit of 100000 and could cause high memory usage. Consider not using high-cardinality values like unique IDs as metric tags or, if you need them in the URL, use the name metric tag or URL grouping. See https://grafana.com/docs/k6/latest/using-k6/tags-and-groups/ for details.  component=metrics-engine-ingester
WARN[0241] The test has generated metrics with 200104 unique time series, which is higher than the suggested limit of 100000 and could cause high memory usage. Consider not using high-cardinality values like unique IDs as metric tags or, if you need them in the URL, use the name metric tag or URL grouping. See https://grafana.com/docs/k6/latest/using-k6/tags-and-groups/ for details.  component=metrics-engine-ingester


  █ THRESHOLDS 

    http_req_duration
    ✓ 'p(95)<5000' p(95)=997.23ms

    http_req_failed
    ✓ 'rate<0.4' rate=19.19%


  █ TOTAL RESULTS 

    checks_total.......: 106399  381.465088/s
    checks_succeeded...: 100.00% 106399 out of 106399
    checks_failed......: 0.00%   0 out of 106399

    ✓ owner register 201
    ✓ owner login 200
    ✓ create community 201
    ✓ requester register 201
    ✓ requester login 200
    ✓ request 201 ou conflito
    ✓ GET /join-requests 200
    ✓ reject 204 ou conflito

    HTTP
    http_req_duration..............: avg=190.93ms min=2.28ms   med=54.39ms max=3.21s p(90)=487.68ms p(95)=997.23ms
      { expected_response:true }...: avg=204.75ms min=3.17ms   med=47.42ms max=3.21s p(90)=628.51ms p(95)=1.11s   
    http_req_failed................: 19.19% 20418 out of 106399
    http_reqs......................: 106399 381.465088/s

    EXECUTION
    iteration_duration.............: avg=982.07ms min=414.32ms med=687.5ms max=4.28s p(90)=2.13s    p(95)=2.48s   
    iterations.....................: 34883  125.063644/s
    vus............................: 17     min=0               max=600
    vus_max........................: 600    min=600             max=600

    NETWORK
    data_received..................: 85 MB  306 kB/s
    data_sent......................: 43 MB  155 kB/s




running (4m38.9s), 000/600 VUs, 34883 complete and 0 interrupted iterations
default ✓ [======================================] 000/600 VUs  4m0s
marcos@MacBook-Air-de-Marcos community % tion.CommunityBusinessException: Esta solicitação já foi processada.]
2026-05-28T08:40:22.797-03:00  WARN 1782 --- [biblioo] [-handler-575570] .m.m.a.ExceptionHandlerExceptionResolver : Resolved [com.biblioo.community.domain.exception.CommunityBusinessException: Esta solicitação já foi processada.]
2026-05-28T08:40:22.798-03:00  WARN 1782 --- [biblioo] [-handler-575567] .m.m.a.ExceptionHandlerExceptionResolver : Resolved [com.biblioo.community.domain.exception.CommunityBusinessException: Já existe uma solicitação pendente.]
2026-05-28T08:40:22.809-03:00  WARN 1782 --- [biblioo] [-handler-575575] .m.m.a.ExceptionHandlerExceptionResolver : Resolved [com.biblioo.community.domain.exception.CommunityBusinessException: Já existe uma solicitação pendente.]
2026-05-28T08:40:22.819-03:00  WARN 1782 --- [biblioo] [-handler-575580] .m.m.a.ExceptionHandlerExceptionResolver : Resolved [com.biblioo.community.domain.exception.CommunityBusinessException: Esta solicitação já foi processada.]
2026-05-28T08:40:22.827-03:00  WARN 1782 --- [biblioo] [-handler-575581] .m.m.a.ExceptionHandlerExceptionResolver : Resolved [com.biblioo.community.domain.exception.CommunityBusinessException: Já existe uma solicitação pendente.]
2026-05-28T08:40:22.832-03:00  WARN 1782 --- [biblioo] [-handler-575583] .m.m.a.ExceptionHandlerExceptionResolver : Resolved [com.biblioo.community.domain.exception.CommunityBusinessException: Esta solicitação já foi processada.]
2026-05-28T08:40:22.835-03:00  WARN 1782 --- [biblioo] [-handler-575587] .m.m.a.ExceptionHandlerExceptionResolver : Resolved [com.biblioo.community.domain.exception.CommunityBusinessException: Esta solicitação já foi processada.]
2026-05-28T08:40:22.850-03:00  WARN 1782 --- [biblioo] [-handler-575595] .m.m.a.ExceptionHandlerExceptionResolver : Resolved [com.biblioo.community.domain.exception.CommunityBusinessException: Esta solicitação já foi processada.]
2026-05-28T08:40:22.852-03:00  WARN 1782 --- [biblioo] [-handler-575596] .m.m.a.ExceptionHandlerExceptionResolver : Resolved [com.biblioo.community.domain.exception.CommunityBusinessException: Esta solicitação já foi processada.]
2026-05-28T08:40:22.866-03:00  WARN 1782 --- [biblioo] [-handler-575601] .m.m.a.ExceptionHandlerExceptionResolver : Resolved [com.biblioo.community.domain.exception.CommunityBusinessException: Esta solicitação já foi processada.]
2026-05-28T08:40:22.888-03:00  WARN 1782 --- [biblioo] [-handler-575606] .m.m.a.ExceptionHandlerExceptionResolver : Resolved [com.biblioo.community.domain.exception.CommunityBusinessException: Já existe uma solicitação pendente.]
2026-05-28T08:40:22.907-03:00  WARN 1782 --- [biblioo] [-handler-575616] .m.m.a.ExceptionHandlerExceptionResolver : Resolved [com.biblioo.community.domain.exception.CommunityBusinessException: Já existe uma solicitação pendente.]
2026-05-28T08:40:22.948-03:00  WARN 1782 --- [biblioo] [-handler-575638] .m.m.a.ExceptionHandlerExceptionResolver : Resolved [com.biblioo.community.domain.exception.CommunityBusinessException: Já existe uma solicitação pendente.]
2026-05-28T08:40:22.962-03:00  WARN 1782 --- [biblioo] [-handler-575643] .m.m.a.ExceptionHandlerExceptionResolver : Resolved [com.biblioo.community.domain.exception.CommunityBusinessException: Já existe uma solicitação pendente.]
2026-05-28T08:40:22.971-03:00  WARN 1782 --- [biblioo] [-handler-575646] .m.m.a.ExceptionHandlerExceptionResolver : Resolved [com.biblioo.community.domain.exception.CommunityBusinessException: Já existe uma solicitação pendente.]
2026-05-28T08:40:22.984-03:00  WARN 1782 --- [biblioo] [-handler-575650] .m.m.a.ExceptionHandlerExceptionResolver : Resolved [com.biblioo.community.domain.exception.CommunityBusinessException: Já existe uma solicitação pendente.]
2026-05-28T08:40:22.985-03:00  WARN 1782 --- [biblioo] [-handler-575652] .m.m.a.ExceptionHandlerExceptionResolver : Resolved [com.biblioo.community.domain.exception.CommunityBusinessException: Esta solicitação já foi processada.]
2026-05-28T08:40:22.987-03:00  WARN 1782 --- [biblioo] [-handler-575653] .m.m.a.ExceptionHandlerExceptionResolver : Resolved [com.biblioo.community.domain.exception.CommunityBusinessException: Esta solicitação já foi processada.]
2026-05-28T08:40:23.005-03:00  WARN 1782 --- [biblioo] [-handler-575661] .m.m.a.ExceptionHandlerExceptionResolver : Resolved [com.biblioo.community.domain.exception.CommunityBusinessException: Já existe uma solicitação pendente.]
2026-05-28T08:40:23.005-03:00  WARN 1782 --- [biblioo] [-handler-575662] .m.m.a.ExceptionHandlerExceptionResolver : Resolved [com.biblioo.community.domain.exception.CommunityBusinessException: Já existe uma solicitação pendente.]
2026-05-28T08:40:23.028-03:00  WARN 1782 --- [biblioo] [-handler-575673] .m.m.a.ExceptionHandlerExceptionResolver : Resolved [com.biblioo.community.domain.exception.CommunityBusinessException: Já existe uma solicitação pendente.]
2026-05-28T08:40:23.041-03:00  WARN 1782 --- [biblioo] [-handler-575680] .m.m.a.ExceptionHandlerExceptionResolver : Resolved [com.biblioo.community.domain.exception.CommunityBusinessException: Esta solicitação já foi processada.]
2026-05-28T08:40:23.062-03:00  WARN 1782 --- [biblioo] [-handler-575691] .m.m.a.ExceptionHandlerExceptionResolver : Resolved [com.biblioo.community.domain.exception.CommunityBusinessException: Já existe uma solicitação pendente.]
2026-05-28T08:40:23.062-03:00  WARN 1782 --- [biblioo] [-handler-575689] .m.m.a.ExceptionHandlerExceptionResolver : Resolved [com.biblioo.community.domain.exception.CommunityBusinessException: Já existe uma solicitação pendente.]
2026-05-28T08:40:23.074-03:00  WARN 1782 --- [biblioo] [-handler-575697] .m.m.a.ExceptionHandlerExceptionResolver : Resolved [com.biblioo.community.domain.exception.CommunityBusinessException: Esta solicitação já foi processada.]
2026-05-28T08:40:23.085-03:00  WARN 1782 --- [biblioo] [-handler-575701] .m.m.a.ExceptionHandlerExceptionResolver : Resolved [com.biblioo.community.domain.exception.CommunityBusinessException: Já existe uma solicitação pendente.]
2026-05-28T08:40:23.093-03:00  WARN 1782 --- [biblioo] [-handler-575702] .m.m.a.ExceptionHandlerExceptionResolver : Resolved [com.biblioo.community.domain.exception.CommunityBusinessException: Já existe uma solicitação pendente.]
2026-05-28T08:40:23.122-03:00  WARN 1782 --- [biblioo] [-handler-575716] .m.m.a.ExceptionHandlerExceptionResolver : Resolved [com.biblioo.community.domain.exception.CommunityBusinessException: Já existe uma solicitação pendente.]
2026-05-28T08:40:23.122-03:00  WARN 1782 --- [biblioo] [-handler-575717] .m.m.a.ExceptionHandlerExceptionResolver : Resolved [com.biblioo.community.domain.exception.CommunityBusinessException: Já existe uma solicitação pendente.]
2026-05-28T08:40:23.132-03:00  WARN 1782 --- [biblioo] [-handler-575721] .m.m.a.ExceptionHandlerExceptionResolver : Resolved [com.biblioo.community.domain.exception.CommunityBusinessException: Já existe uma solicitação pendente.]
2026-05-28T08:40:23.148-03:00  WARN 1782 --- [biblioo] [-handler-575728] .m.m.a.ExceptionHandlerExceptionResolver : Resolved [com.biblioo.community.domain.exception.CommunityBusinessException: Já existe uma solicitação pendente.]
2026-05-28T08:40:23.152-03:00  WARN 1782 --- [biblioo] [-handler-575729] .m.m.a.ExceptionHandlerExceptionResolver : Resolved [com.biblioo.community.domain.exception.CommunityBusinessException: Já existe uma solicitação pendente.]
2026-05-28T08:40:23.171-03:00  WARN 1782 --- [biblioo] [-handler-575739] .m.m.a.ExceptionHandlerExceptionResolver : Resolved [com.biblioo.community.domain.exception.CommunityBusinessException: Já existe uma solicitação pendente.]
2026-05-28T08:40:23.179-03:00  WARN 1782 --- [biblioo] [-handler-575741] .m.m.a.ExceptionHandlerExceptionResolver : Resolved [com.biblioo.community.domain.exception.CommunityBusinessException: Já existe uma solicitação pendente.]
2026-05-28T08:40:23.183-03:00  WARN 1782 --- [biblioo] [-handler-575742] .m.m.a.ExceptionHandlerExceptionResolver : Resolved [com.biblioo.community.domain.exception.CommunityBusinessException: Já existe uma solicitação pendente.]
2026-05-28T08:40:23.219-03:00  WARN 1782 --- [biblioo] [-handler-575752] .m.m.a.ExceptionHandlerExceptionResolver : Resolved [com.biblioo.community.domain.exception.CommunityBusinessException: Já existe uma solicitação pendente.]
2026-05-28T08:40:23.247-03:00  WARN 1782 --- [biblioo] [-handler-575770] .m.m.a.ExceptionHandlerExceptionResolver : Resolved [com.biblioo.community.domain.exception.CommunityBusinessException: Já existe uma solicitação pendente.]
2026-05-28T08:40:23.264-03:00  WARN 1782 --- [biblioo] [-handler-575778] .m.m.a.ExceptionHandlerExceptionResolver : Resolved [com.biblioo.community.domain.exception.CommunityBusinessException: Esta solicitação já foi processada.]
2026-05-28T08:40:23.265-03:00  WARN 1782 --- [biblioo] [-handler-575777] .m.m.a.ExceptionHandlerExceptionResolver : Resolved [com.biblioo.community.domain.exception.CommunityBusinessException: Esta solicitação já foi processada.]
2026-05-28T08:40:23.276-03:00  WARN 1782 --- [biblioo] [-handler-575782] .m.m.a.ExceptionHandlerExceptionResolver : Resolved [com.biblioo.community.domain.exception.CommunityBusinessException: Já existe uma solicitação pendente.]
2026-05-28T08:40:23.280-03:00  WARN 1782 --- [biblioo] [-handler-575783] .m.m.a.ExceptionHandlerExceptionResolver : Resolved [com.biblioo.community.domain.exception.CommunityBusinessException: Já existe uma solicitação pendente.]
2026-05-28T08:40:23.282-03:00  WARN 1782 --- [biblioo] [-handler-575786] .m.m.a.ExceptionHandlerExceptionResolver : Resolved [com.biblioo.community.domain.exception.CommunityBusinessException: Esta solicitação já foi processada.]
2026-05-28T08:40:23.284-03:00  WARN 1782 --- [biblioo] [-handler-575785] .m.m.a.ExceptionHandlerExceptionResolver : Resolved [com.biblioo.community.domain.exception.CommunityBusinessException: Já existe uma solicitação pendente.]
2026-05-28T08:40:23.319-03:00  WARN 1782 --- [biblioo] [-handler-575796] .m.m.a.ExceptionHandlerExceptionResolver : Resolved [com.biblioo.community.domain.exception.CommunityBusinessException: Esta solicitação já foi processada.]
2026-05-28T08:40:23.334-03:00  WARN 1782 --- [biblioo] [-handler-575799] .m.m.a.ExceptionHandlerExceptionResolver : Resolved [com.biblioo.community.domain.exception.CommunityBusinessException: Esta solicitação já foi processada.]
2026-05-28T08:40:23.342-03:00  WARN 1782 --- [biblioo] [-handler-575804] .m.m.a.ExceptionHandlerExceptionResolver : Resolved [com.biblioo.community.domain.exception.CommunityBusinessException: Esta solicitação já foi processada.]
2026-05-28T08:40:23.373-03:00  WARN 1782 --- [biblioo] [-handler-575813] .m.m.a.ExceptionHandlerExceptionResolver : Resolved [com.biblioo.community.domain.exception.CommunityBusinessException: Já existe uma solicitação pendente.]
2026-05-28T08:40:23.380-03:00  WARN 1782 --- [biblioo] [-handler-575816] .m.m.a.ExceptionHandlerExceptionResolver : Resolved [com.biblioo.community.domain.exception.CommunityBusinessException: Já existe uma solicitação pendente.]
2026-05-28T08:40:23.417-03:00  WARN 1782 --- [biblioo] [-handler-575835] .m.m.a.ExceptionHandlerExceptionResolver : Resolved [com.biblioo.community.domain.exception.CommunityBusinessException: Já existe uma solicitação pendente.]
2026-05-28T08:40:23.432-03:00  WARN 1782 --- [biblioo] [-handler-575841] .m.m.a.ExceptionHandlerExceptionResolver : Resolved [com.biblioo.community.domain.exception.CommunityBusinessException: Já existe uma solicitação pendente.]
2026-05-28T08:40:23.434-03:00  WARN 1782 --- [biblioo] [-handler-575843] .m.m.a.ExceptionHandlerExceptionResolver : Resolved [com.biblioo.community.domain.exception.CommunityBusinessException: Já existe uma solicitação pendente.]
2026-05-28T08:40:23.437-03:00  WARN 1782 --- [biblioo] [-handler-575847] .m.m.a.ExceptionHandlerExceptionResolver : Resolved [com.biblioo.community.domain.exception.CommunityBusinessException: Já existe uma solicitação pendente.]
2026-05-28T08:40:23.437-03:00  WARN 1782 --- [biblioo] [-handler-575848] .m.m.a.ExceptionHandlerExceptionResolver : Resolved [com.biblioo.community.domain.exception.CommunityBusinessException: Já existe uma solicitação pendente.]
2026-05-28T08:40:23.472-03:00  WARN 1782 --- [biblioo] [-handler-575857] .m.m.a.ExceptionHandlerExceptionResolver : Resolved [com.biblioo.community.domain.exception.CommunityBusinessException: Já existe uma solicitação pendente.]
2026-05-28T08:40:23.526-03:00  WARN 1782 --- [biblioo] [-handler-575873] .m.m.a.ExceptionHandlerExceptionResolver : Resolved [com.biblioo.community.domain.exception.CommunityBusinessException: Já existe uma solicitação pendente.]
2026-05-28T08:40:23.547-03:00  WARN 1782 --- [biblioo] [-handler-575886] .m.m.a.ExceptionHandlerExceptionResolver : Resolved [com.biblioo.community.domain.exception.CommunityBusinessException: Esta solicitação já foi processada.]
2026-05-28T08:40:23.603-03:00  WARN 1782 --- [biblioo] [-handler-575901] .m.m.a.ExceptionHandlerExceptionResolver : Resolved [com.biblioo.community.domain.exception.CommunityBusinessException: Já existe uma solicitação pendente.]
2026-05-28T08:40:23.618-03:00  WARN 1782 --- [biblioo] [-handler-575908] .m.m.a.ExceptionHandlerExceptionResolver : Resolved [com.biblioo.community.domain.exception.CommunityBusinessException: Já existe uma solicitação pendente.]
2026-05-28T08:40:23.643-03:00  WARN 1782 --- [biblioo] [-handler-575914] .m.m.a.ExceptionHandlerExceptionResolver : Resolved [com.biblioo.community.domain.exception.CommunityBusinessException: Já existe uma solicitação pendente.]
2026-05-28T08:40:23.652-03:00  WARN 1782 --- [biblioo] [-handler-575920] .m.m.a.ExceptionHandlerExceptionResolver : Resolved [com.biblioo.community.domain.exception.CommunityBusinessException: Já existe uma solicitação pendente.]
2026-05-28T08:40:23.653-03:00  WARN 1782 --- [biblioo] [-handler-575921] .m.m.a.ExceptionHandlerExceptionResolver : Resolved [com.biblioo.community.domain.exception.CommunityBusinessException: Já existe uma solicitação pendente.]
2026-05-28T08:40:23.711-03:00  WARN 1782 --- [biblioo] [-handler-575933] .m.m.a.ExceptionHandlerExceptionResolver : Resolved [com.biblioo.community.domain.exception.CommunityBusinessException: Já existe uma solicitação pendente.]
2026-05-28T08:40:23.722-03:00  WARN 1782 --- [biblioo] [-handler-575938] .m.m.a.ExceptionHandlerExceptionResolver : Resolved [com.biblioo.community.domain.exception.CommunityBusinessException: Esta solicitação já foi processada.]
2026-05-28T08:40:23.748-03:00  WARN 1782 --- [biblioo] [-handler-575948] .m.m.a.ExceptionHandlerExceptionResolver : Resolved [com.biblioo.community.domain.exception.CommunityBusinessException: Já existe uma solicitação pendente.]
2026-05-28T08:40:23.779-03:00  WARN 1782 --- [biblioo] [-handler-575961] .m.m.a.ExceptionHandlerExceptionResolver : Resolved [com.biblioo.community.domain.exception.CommunityBusinessException: Esta solicitação já foi processada.]
2026-05-28T08:40:23.783-03:00  WARN 1782 --- [biblioo] [-handler-575963] .m.m.a.ExceptionHandlerExceptionResolver : Resolved [com.biblioo.community.domain.exception.CommunityBusinessException: Esta solicitação já foi processada.]
2026-05-28T08:40:23.801-03:00  WARN 1782 --- [biblioo] [-handler-575971] .m.m.a.ExceptionHandlerExceptionResolver : Resolved [com.biblioo.community.domain.exception.CommunityBusinessException: Esta solicitação já foi processada.]
2026-05-28T08:40:23.816-03:00  WARN 1782 --- [biblioo] [-handler-575975] .m.m.a.ExceptionHandlerExceptionResolver : Resolved [com.biblioo.community.domain.exception.CommunityBusinessException: Esta solicitação já foi processada.]
2026-05-28T08:40:23.825-03:00  WARN 1782 --- [biblioo] [-handler-575978] .m.m.a.ExceptionHandlerExceptionResolver : Resolved [com.biblioo.community.domain.exception.CommunityBusinessException: Já existe uma solicitação pendente.]
2026-05-28T08:40:23.840-03:00  WARN 1782 --- [biblioo] [-handler-575979] .m.m.a.ExceptionHandlerExceptionResolver : Resolved [com.biblioo.community.domain.exception.CommunityBusinessException: Já existe uma solicitação pendente.]
2026-05-28T08:40:23.850-03:00  WARN 1782 --- [biblioo] [-handler-575980] .m.m.a.ExceptionHandlerExceptionResolver : Resolved [com.biblioo.community.domain.exception.CommunityBusinessException: Já existe uma solicitação pendente.]
2026-05-28T08:40:23.856-03:00  WARN 1782 --- [biblioo] [-handler-575986] .m.m.a.ExceptionHandlerExceptionResolver : Resolved [com.biblioo.community.domain.exception.CommunityBusinessException: Já existe uma solicitação pendente.]
2026-05-28T08:40:23.884-03:00  WARN 1782 --- [biblioo] [-handler-575996] .m.m.a.ExceptionHandlerExceptionResolver : Resolved [com.biblioo.community.domain.exception.CommunityBusinessException: Esta solicitação já foi processada.]
2026-05-28T08:40:23.949-03:00  WARN 1782 --- [biblioo] [-handler-576017] .m.m.a.ExceptionHandlerExceptionResolver : Resolved [com.biblioo.community.domain.exception.CommunityBusinessException: Já existe uma solicitação pendente.]
2026-05-28T08:40:24.126-03:00  WARN 1782 --- [biblioo] [-handler-576074] .m.m.a.ExceptionHandlerExceptionResolver : Resolved [com.biblioo.community.domain.exception.CommunityBusinessException: Já existe uma solicitação pendente.]
2026-05-28T08:40:24.162-03:00  WARN 1782 --- [biblioo] [-handler-576083] .m.m.a.ExceptionHandlerExceptionResolver : Resolved [com.biblioo.community.domain.exception.CommunityBusinessException: Já existe uma solicitação pendente.]
2026-05-28T08:40:24.185-03:00  WARN 1782 --- [biblioo] [-handler-576090] .m.m.a.ExceptionHandlerExceptionResolver : Resolved [com.biblioo.community.domain.exception.CommunityBusinessException: Esta solicitação já foi processada.]
2026-05-28T08:40:24.206-03:00  WARN 1782 --- [biblioo] [-handler-576095] .m.m.a.ExceptionHandlerExceptionResolver : Resolved [com.biblioo.community.domain.exception.CommunityBusinessException: Já existe uma solicitação pendente.]
2026-05-28T08:40:24.245-03:00  WARN 1782 --- [biblioo] [-handler-576108] .m.m.a.ExceptionHandlerExceptionResolver : Resolved [com.biblioo.community.domain.exception.CommunityBusinessException: Já existe uma solicitação pendente.]
2026-05-28T08:40:24.284-03:00  WARN 1782 --- [biblioo] [-handler-576121] .m.m.a.ExceptionHandlerExceptionResolver : Resolved [com.biblioo.community.domain.exception.CommunityBusinessException: Já existe uma solicitação pendente.]
2026-05-28T08:40:24.391-03:00  WARN 1782 --- [biblioo] [-handler-576149] .m.m.a.ExceptionHandlerExceptionResolver : Resolved [com.biblioo.community.domain.exception.CommunityBusinessException: Já existe uma solicitação pendente.]
2026-05-28T08:40:24.451-03:00  WARN 1782 --- [biblioo] [-handler-576164] .m.m.a.ExceptionHandlerExceptionResolver : Resolved [com.biblioo.community.domain.exception.CommunityBusinessException: Já existe uma solicitação pendente.]
2026-05-28T08:40:24.459-03:00  WARN 1782 --- [biblioo] [-handler-576167] .m.m.a.ExceptionHandlerExceptionResolver : Resolved [com.biblioo.community.domain.exception.CommunityBusinessException: Já existe uma solicitação pendente.]
2026-05-28T08:40:24.474-03:00  WARN 1782 --- [biblioo] [-handler-576173] .m.m.a.ExceptionHandlerExceptionResolver : Resolved [com.biblioo.community.domain.exception.CommunityBusinessException: Já existe uma solicitação pendente.]
2026-05-28T08:40:24.479-03:00  WARN 1782 --- [biblioo] [-handler-576175] .m.m.a.ExceptionHandlerExceptionResolver : Resolved [com.biblioo.community.domain.exception.CommunityBusinessException: Já existe uma solicitação pendente.]
2026-05-28T08:40:24.482-03:00  WARN 1782 --- [biblioo] [-handler-576176] .m.m.a.ExceptionHandlerExceptionResolver : Resolved [com.biblioo.community.domain.exception.CommunityBusinessException: Já existe uma solicitação pendente.]
2026-05-28T08:40:24.585-03:00  WARN 1782 --- [biblioo] [-handler-576199] .m.m.a.ExceptionHandlerExceptionResolver : Resolved [com.biblioo.community.domain.exception.CommunityBusinessException: Já existe uma solicitação pendente.]
2026-05-28T08:40:24.600-03:00  WARN 1782 --- [biblioo] [-handler-576206] .m.m.a.ExceptionHandlerExceptionResolver : Resolved [com.biblioo.community.domain.exception.CommunityBusinessException: Já existe uma solicitação pendente.]
2026-05-28T08:40:24.637-03:00  WARN 1782 --- [biblioo] [-handler-576211] .m.m.a.ExceptionHandlerExceptionResolver : Resolved [com.biblioo.community.domain.exception.CommunityBusinessException: Já existe uma solicitação pendente.]
2026-05-28T08:40:24.680-03:00  WARN 1782 --- [biblioo] [-handler-576221] .m.m.a.ExceptionHandlerExceptionResolver : Resolved [com.biblioo.community.domain.exception.CommunityBusinessException: Já existe uma solicitação pendente.]
2026-05-28T08:40:24.732-03:00  WARN 1782 --- [biblioo] [-handler-576234] .m.m.a.ExceptionHandlerExceptionResolver : Resolved [com.biblioo.community.domain.exception.CommunityBusinessException: Já existe uma solicitação pendente.]
2026-05-28T08:40:24.884-03:00  WARN 1782 --- [biblioo] [-handler-576267] .m.m.a.ExceptionHandlerExceptionResolver : Resolved [com.biblioo.community.domain.exception.CommunityBusinessException: Já existe uma solicitação pendente.]
2026-05-28T08:40:24.925-03:00  WARN 1782 --- [biblioo] [-handler-576277] .m.m.a.ExceptionHandlerExceptionResolver : Resolved [com.biblioo.community.domain.exception.CommunityBusinessException: Já existe uma solicitação pendente.]
2026-05-28T08:40:24.954-03:00  WARN 1782 --- [biblioo] [-handler-576285] .m.m.a.ExceptionHandlerExceptionResolver : Resolved [com.biblioo.community.domain.exception.CommunityBusinessException: Já existe uma solicitação pendente.]
2026-05-28T08:40:25.089-03:00  WARN 1782 --- [biblioo] [-handler-576309] .m.m.a.ExceptionHandlerExceptionResolver : Resolved [com.biblioo.community.domain.exception.CommunityBusinessException: Já existe uma solicitação pendente.]
2026-05-28T08:40:25.138-03:00  WARN 1782 --- [biblioo] [-handler-576317] .m.m.a.ExceptionHandlerExceptionResolver : Resolved [com.biblioo.community.domain.exception.CommunityBusinessException: Já existe uma solicitação pendente.]
2026-05-28T08:40:25.229-03:00  WARN 1782 --- [biblioo] [-handler-576335] .m.m.a.ExceptionHandlerExceptionResolver : Resolved [com.biblioo.community.domain.exception.CommunityBusinessException: Já existe uma solicitação pendente.]
2026-05-28T08:40:25.309-03:00  WARN 1782 --- [biblioo] [-handler-576344] .m.m.a.ExceptionHandlerExceptionResolver : Resolved [com.biblioo.community.domain.exception.CommunityBusinessException: Já existe uma solicitação pendente.]
2026-05-28T08:40:25.370-03:00  WARN 1782 --- [biblioo] [-handler-576352] .m.m.a.ExceptionHandlerExceptionResolver : Resolved [com.biblioo.community.domain.exception.CommunityBusinessException: Já existe uma solicitação pendente.]
2026-05-28T08:40:25.578-03:00  WARN 1782 --- [biblioo] [-handler-576380] .m.m.a.ExceptionHandlerExceptionResolver : Resolved [com.biblioo.community.domain.exception.CommunityBusinessException: Já existe uma solicitação pendente.]
2026-05-28T08:40:25.760-03:00  WARN 1782 --- [biblioo] [-handler-576401] .m.m.a.ExceptionHandlerExceptionResolver : Resolved [com.biblioo.community.domain.exception.CommunityBusinessException: Já existe uma solicitação pendente.]
2026-05-28T08:40:25.808-03:00  WARN 1782 --- [biblioo] [-handler-576407] .m.m.a.ExceptionHandlerExceptionResolver : Resolved [com.biblioo.community.domain.exception.CommunityBusinessException: Já existe uma solicitação pendente.]
################################################################
# TESTES PENDENTES EXECUTADOS EM 2026-05-28 17:20
################################################################

================================================================
% cd DomainCommunity/community && k6 run community-manage-stress.js
================================================================


         /\      Grafana   /‾‾/  
    /\  /  \     |\  __   /  /   
   /  \/    \    | |/ /  /   ‾‾\ 
  /          \   |   (  |  (‾)  |
 / __________ \  |_|\_\  \_____/ 


     execution: local
        script: community-manage-stress.js
        output: -

     scenarios: (100.00%) 1 scenario, 200 max VUs, 4m0s max duration (incl. graceful stop):
              * default: Up to 200 looping VUs for 3m30s over 7 stages (gracefulRampDown: 30s, gracefulStop: 30s)


Run       [ 100% ] setup()
default   [   0% ]

Run       [ 100% ] setup()
default   [   0% ]

Run       [ 100% ] setup()
default   [   0% ]

Run       [ 100% ] setup()
default   [   0% ]

running (0m05.0s), 001/200 VUs, 0 complete and 0 interrupted iterations
default   [   0% ] 001/200 VUs  0m00.1s/3m30.0s

running (0m06.0s), 001/200 VUs, 2 complete and 0 interrupted iterations
default   [   1% ] 001/200 VUs  0m01.1s/3m30.0s

running (0m07.0s), 001/200 VUs, 4 complete and 0 interrupted iterations
default   [   1% ] 001/200 VUs  0m02.1s/3m30.0s

running (0m08.0s), 001/200 VUs, 6 complete and 0 interrupted iterations
default   [   1% ] 001/200 VUs  0m03.1s/3m30.0s

running (0m09.0s), 002/200 VUs, 9 complete and 0 interrupted iterations
default   [   2% ] 002/200 VUs  0m04.1s/3m30.0s

running (0m10.0s), 002/200 VUs, 13 complete and 0 interrupted iterations
default   [   2% ] 002/200 VUs  0m05.1s/3m30.0s

running (0m11.0s), 002/200 VUs, 17 complete and 0 interrupted iterations
default   [   3% ] 002/200 VUs  0m06.1s/3m30.0s

running (0m12.0s), 003/200 VUs, 23 complete and 0 interrupted iterations
default   [   3% ] 003/200 VUs  0m07.1s/3m30.0s

running (0m13.0s), 003/200 VUs, 29 complete and 0 interrupted iterations
default   [   4% ] 003/200 VUs  0m08.1s/3m30.0s

running (0m14.0s), 003/200 VUs, 36 complete and 0 interrupted iterations
default   [   4% ] 003/200 VUs  0m09.1s/3m30.0s

running (0m15.0s), 004/200 VUs, 42 complete and 0 interrupted iterations
default   [   5% ] 004/200 VUs  0m10.1s/3m30.0s

running (0m16.0s), 004/200 VUs, 50 complete and 0 interrupted iterations
default   [   5% ] 004/200 VUs  0m11.1s/3m30.0s

running (0m17.0s), 004/200 VUs, 58 complete and 0 interrupted iterations
default   [   6% ] 004/200 VUs  0m12.1s/3m30.0s

running (0m18.0s), 004/200 VUs, 66 complete and 0 interrupted iterations
default   [   6% ] 004/200 VUs  0m13.1s/3m30.0s

running (0m19.0s), 005/200 VUs, 75 complete and 0 interrupted iterations
default   [   7% ] 005/200 VUs  0m14.1s/3m30.0s

running (0m20.0s), 005/200 VUs, 85 complete and 0 interrupted iterations
default   [   7% ] 005/200 VUs  0m15.1s/3m30.0s

running (0m21.0s), 005/200 VUs, 95 complete and 0 interrupted iterations
default   [   8% ] 005/200 VUs  0m16.1s/3m30.0s

running (0m22.0s), 006/200 VUs, 105 complete and 0 interrupted iterations
default   [   8% ] 006/200 VUs  0m17.1s/3m30.0s

running (0m23.0s), 006/200 VUs, 118 complete and 0 interrupted iterations
default   [   9% ] 006/200 VUs  0m18.1s/3m30.0s

running (0m24.0s), 006/200 VUs, 134 complete and 0 interrupted iterations
default   [   9% ] 006/200 VUs  0m19.1s/3m30.0s

running (0m25.0s), 007/200 VUs, 146 complete and 0 interrupted iterations
default   [  10% ] 007/200 VUs  0m20.1s/3m30.0s

running (0m26.0s), 007/200 VUs, 161 complete and 0 interrupted iterations
default   [  10% ] 007/200 VUs  0m21.1s/3m30.0s

running (0m27.0s), 007/200 VUs, 175 complete and 0 interrupted iterations
default   [  11% ] 007/200 VUs  0m22.1s/3m30.0s

running (0m28.0s), 007/200 VUs, 189 complete and 0 interrupted iterations
default   [  11% ] 007/200 VUs  0m23.1s/3m30.0s

running (0m29.0s), 008/200 VUs, 204 complete and 0 interrupted iterations
default   [  11% ] 008/200 VUs  0m24.1s/3m30.0s

running (0m30.0s), 008/200 VUs, 220 complete and 0 interrupted iterations
default   [  12% ] 008/200 VUs  0m25.1s/3m30.0s

running (0m31.0s), 008/200 VUs, 238 complete and 0 interrupted iterations
default   [  12% ] 008/200 VUs  0m26.1s/3m30.0s

running (0m32.0s), 009/200 VUs, 254 complete and 0 interrupted iterations
default   [  13% ] 009/200 VUs  0m27.1s/3m30.0s

running (0m33.0s), 009/200 VUs, 273 complete and 0 interrupted iterations
default   [  13% ] 009/200 VUs  0m28.1s/3m30.0s

running (0m34.0s), 009/200 VUs, 297 complete and 0 interrupted iterations
default   [  14% ] 009/200 VUs  0m29.1s/3m30.0s

running (0m35.0s), 010/200 VUs, 315 complete and 0 interrupted iterations
default   [  14% ] 010/200 VUs  0m30.1s/3m30.0s

running (0m36.0s), 010/200 VUs, 335 complete and 0 interrupted iterations
default   [  15% ] 010/200 VUs  0m31.1s/3m30.0s

running (0m37.0s), 010/200 VUs, 355 complete and 0 interrupted iterations
default   [  15% ] 010/200 VUs  0m32.1s/3m30.0s

running (0m38.0s), 011/200 VUs, 375 complete and 0 interrupted iterations
default   [  16% ] 011/200 VUs  0m33.1s/3m30.0s

running (0m39.0s), 011/200 VUs, 397 complete and 0 interrupted iterations
default   [  16% ] 011/200 VUs  0m34.1s/3m30.0s

running (0m40.0s), 011/200 VUs, 419 complete and 0 interrupted iterations
default   [  17% ] 011/200 VUs  0m35.1s/3m30.0s

running (0m41.0s), 012/200 VUs, 441 complete and 0 interrupted iterations
default   [  17% ] 012/200 VUs  0m36.1s/3m30.0s

running (0m42.0s), 012/200 VUs, 465 complete and 0 interrupted iterations
default   [  18% ] 012/200 VUs  0m37.1s/3m30.0s

running (0m43.0s), 012/200 VUs, 489 complete and 0 interrupted iterations
default   [  18% ] 012/200 VUs  0m38.1s/3m30.0s

running (0m44.0s), 013/200 VUs, 513 complete and 0 interrupted iterations
default   [  19% ] 013/200 VUs  0m39.1s/3m30.0s

running (0m45.0s), 013/200 VUs, 543 complete and 0 interrupted iterations
default   [  19% ] 013/200 VUs  0m40.1s/3m30.0s

running (0m46.0s), 013/200 VUs, 569 complete and 0 interrupted iterations
default   [  20% ] 013/200 VUs  0m41.1s/3m30.0s

running (0m47.0s), 014/200 VUs, 595 complete and 0 interrupted iterations
default   [  20% ] 014/200 VUs  0m42.1s/3m30.0s

running (0m48.0s), 014/200 VUs, 632 complete and 0 interrupted iterations
default   [  21% ] 014/200 VUs  0m43.1s/3m30.0s

running (0m49.0s), 014/200 VUs, 660 complete and 0 interrupted iterations
default   [  21% ] 014/200 VUs  0m44.1s/3m30.0s

running (0m50.0s), 015/200 VUs, 688 complete and 0 interrupted iterations
default   [  21% ] 015/200 VUs  0m45.1s/3m30.0s

running (0m51.0s), 015/200 VUs, 718 complete and 0 interrupted iterations
default   [  22% ] 015/200 VUs  0m46.1s/3m30.0s

running (0m52.0s), 015/200 VUs, 748 complete and 0 interrupted iterations
default   [  22% ] 015/200 VUs  0m47.1s/3m30.0s

running (0m53.0s), 016/200 VUs, 778 complete and 0 interrupted iterations
default   [  23% ] 016/200 VUs  0m48.1s/3m30.0s

running (0m54.0s), 016/200 VUs, 810 complete and 0 interrupted iterations
default   [  23% ] 016/200 VUs  0m49.1s/3m30.0s

running (0m55.0s), 016/200 VUs, 842 complete and 0 interrupted iterations
default   [  24% ] 016/200 VUs  0m50.1s/3m30.0s

running (0m56.0s), 017/200 VUs, 874 complete and 0 interrupted iterations
default   [  24% ] 017/200 VUs  0m51.1s/3m30.0s

running (0m57.0s), 017/200 VUs, 908 complete and 0 interrupted iterations
default   [  25% ] 017/200 VUs  0m52.1s/3m30.0s

running (0m58.0s), 017/200 VUs, 947 complete and 0 interrupted iterations
default   [  25% ] 017/200 VUs  0m53.1s/3m30.0s

running (0m59.0s), 018/200 VUs, 981 complete and 0 interrupted iterations
default   [  26% ] 018/200 VUs  0m54.1s/3m30.0s

running (1m00.0s), 018/200 VUs, 1029 complete and 0 interrupted iterations
default   [  26% ] 018/200 VUs  0m55.1s/3m30.0s

running (1m01.0s), 018/200 VUs, 1065 complete and 0 interrupted iterations
default   [  27% ] 018/200 VUs  0m56.1s/3m30.0s

running (1m02.0s), 019/200 VUs, 1101 complete and 0 interrupted iterations
default   [  27% ] 019/200 VUs  0m57.1s/3m30.0s

running (1m03.0s), 019/200 VUs, 1140 complete and 0 interrupted iterations
default   [  28% ] 019/200 VUs  0m58.1s/3m30.0s

running (1m04.0s), 019/200 VUs, 1178 complete and 0 interrupted iterations
default   [  28% ] 019/200 VUs  0m59.1s/3m30.0s

running (1m05.0s), 020/200 VUs, 1221 complete and 0 interrupted iterations
default   [  29% ] 020/200 VUs  1m00.1s/3m30.0s

running (1m06.0s), 021/200 VUs, 1261 complete and 0 interrupted iterations
default   [  29% ] 021/200 VUs  1m01.1s/3m30.0s

running (1m07.0s), 022/200 VUs, 1316 complete and 0 interrupted iterations
default   [  30% ] 022/200 VUs  1m02.1s/3m30.0s

running (1m08.0s), 023/200 VUs, 1360 complete and 0 interrupted iterations
default   [  30% ] 023/200 VUs  1m03.1s/3m30.0s

running (1m09.0s), 024/200 VUs, 1409 complete and 0 interrupted iterations
default   [  31% ] 024/200 VUs  1m04.1s/3m30.0s

running (1m10.0s), 025/200 VUs, 1463 complete and 0 interrupted iterations
default   [  31% ] 025/200 VUs  1m05.1s/3m30.0s

running (1m11.0s), 026/200 VUs, 1513 complete and 0 interrupted iterations
default   [  31% ] 026/200 VUs  1m06.1s/3m30.0s

running (1m12.0s), 027/200 VUs, 1580 complete and 0 interrupted iterations
default   [  32% ] 027/200 VUs  1m07.1s/3m30.0s

running (1m13.0s), 028/200 VUs, 1638 complete and 0 interrupted iterations
default   [  32% ] 028/200 VUs  1m08.1s/3m30.0s

running (1m14.0s), 029/200 VUs, 1697 complete and 0 interrupted iterations
default   [  33% ] 029/200 VUs  1m09.1s/3m30.0s

running (1m15.0s), 030/200 VUs, 1759 complete and 0 interrupted iterations
default   [  33% ] 030/200 VUs  1m10.1s/3m30.0s

running (1m16.0s), 031/200 VUs, 1820 complete and 0 interrupted iterations
default   [  34% ] 031/200 VUs  1m11.1s/3m30.0s

running (1m17.0s), 032/200 VUs, 1903 complete and 0 interrupted iterations
default   [  34% ] 032/200 VUs  1m12.1s/3m30.0s

running (1m18.0s), 033/200 VUs, 1968 complete and 0 interrupted iterations
default   [  35% ] 033/200 VUs  1m13.1s/3m30.0s

running (1m19.0s), 034/200 VUs, 2043 complete and 0 interrupted iterations
default   [  35% ] 034/200 VUs  1m14.1s/3m30.0s

running (1m20.0s), 035/200 VUs, 2113 complete and 0 interrupted iterations
default   [  36% ] 035/200 VUs  1m15.1s/3m30.0s

running (1m21.0s), 036/200 VUs, 2204 complete and 0 interrupted iterations
default   [  36% ] 036/200 VUs  1m16.1s/3m30.0s

running (1m22.0s), 037/200 VUs, 2278 complete and 0 interrupted iterations
default   [  37% ] 037/200 VUs  1m17.1s/3m30.0s

running (1m23.0s), 038/200 VUs, 2364 complete and 0 interrupted iterations
default   [  37% ] 038/200 VUs  1m18.1s/3m30.0s

running (1m24.0s), 039/200 VUs, 2441 complete and 0 interrupted iterations
default   [  38% ] 039/200 VUs  1m19.1s/3m30.0s

running (1m25.0s), 040/200 VUs, 2542 complete and 0 interrupted iterations
default   [  38% ] 040/200 VUs  1m20.1s/3m30.0s

running (1m26.0s), 041/200 VUs, 2624 complete and 0 interrupted iterations
default   [  39% ] 041/200 VUs  1m21.1s/3m30.0s

running (1m27.0s), 042/200 VUs, 2720 complete and 0 interrupted iterations
default   [  39% ] 042/200 VUs  1m22.1s/3m30.0s

running (1m28.0s), 043/200 VUs, 2805 complete and 0 interrupted iterations
default   [  40% ] 043/200 VUs  1m23.1s/3m30.0s

running (1m29.0s), 044/200 VUs, 2916 complete and 0 interrupted iterations
default   [  40% ] 044/200 VUs  1m24.1s/3m30.0s

running (1m30.0s), 045/200 VUs, 3006 complete and 0 interrupted iterations
default   [  41% ] 045/200 VUs  1m25.1s/3m30.0s

running (1m31.0s), 046/200 VUs, 3112 complete and 0 interrupted iterations
default   [  41% ] 046/200 VUs  1m26.1s/3m30.0s

running (1m32.0s), 047/200 VUs, 3205 complete and 0 interrupted iterations
default   [  41% ] 047/200 VUs  1m27.1s/3m30.0s

running (1m33.0s), 048/200 VUs, 3315 complete and 0 interrupted iterations
default   [  42% ] 048/200 VUs  1m28.1s/3m30.0s

running (1m34.0s), 049/200 VUs, 3424 complete and 0 interrupted iterations
default   [  42% ] 049/200 VUs  1m29.1s/3m30.0s

running (1m35.0s), 050/200 VUs, 3532 complete and 0 interrupted iterations
default   [  43% ] 050/200 VUs  1m30.1s/3m30.0s

running (1m36.0s), 051/200 VUs, 3642 complete and 0 interrupted iterations
default   [  43% ] 051/200 VUs  1m31.1s/3m30.0s

running (1m37.0s), 053/200 VUs, 3766 complete and 0 interrupted iterations
default   [  44% ] 053/200 VUs  1m32.1s/3m30.0s

running (1m38.0s), 055/200 VUs, 3885 complete and 0 interrupted iterations
default   [  44% ] 055/200 VUs  1m33.1s/3m30.0s

running (1m39.0s), 056/200 VUs, 4014 complete and 0 interrupted iterations
default   [  45% ] 056/200 VUs  1m34.1s/3m30.0s

running (1m40.0s), 058/200 VUs, 4134 complete and 0 interrupted iterations
default   [  45% ] 058/200 VUs  1m35.1s/3m30.0s

running (1m41.0s), 060/200 VUs, 4283 complete and 0 interrupted iterations
default   [  46% ] 060/200 VUs  1m36.1s/3m30.0s

running (1m42.0s), 061/200 VUs, 4408 complete and 0 interrupted iterations
default   [  46% ] 061/200 VUs  1m37.1s/3m30.0s

running (1m43.0s), 063/200 VUs, 4552 complete and 0 interrupted iterations
default   [  47% ] 063/200 VUs  1m38.1s/3m30.0s

running (1m44.0s), 065/200 VUs, 4683 complete and 0 interrupted iterations
default   [  47% ] 065/200 VUs  1m39.1s/3m30.0s

running (1m45.0s), 066/200 VUs, 4852 complete and 0 interrupted iterations
default   [  48% ] 066/200 VUs  1m40.1s/3m30.0s

running (1m46.0s), 068/200 VUs, 4995 complete and 0 interrupted iterations
default   [  48% ] 068/200 VUs  1m41.1s/3m30.0s

running (1m47.0s), 070/200 VUs, 5153 complete and 0 interrupted iterations
default   [  49% ] 070/200 VUs  1m42.1s/3m30.0s

running (1m48.0s), 071/200 VUs, 5309 complete and 0 interrupted iterations
default   [  49% ] 071/200 VUs  1m43.1s/3m30.0s

running (1m49.0s), 073/200 VUs, 5486 complete and 0 interrupted iterations
default   [  50% ] 073/200 VUs  1m44.1s/3m30.0s
time="2026-05-28T17:22:44-03:00" level=warning msg="The test has generated metrics with 100337 unique time series, which is higher than the suggested limit of 100000 and could cause high memory usage. Consider not using high-cardinality values like unique IDs as metric tags or, if you need them in the URL, use the name metric tag or URL grouping. See https://grafana.com/docs/k6/latest/using-k6/tags-and-groups/ for details." component=metrics-engine-ingester

running (1m50.0s), 075/200 VUs, 5656 complete and 0 interrupted iterations
default   [  50% ] 075/200 VUs  1m45.1s/3m30.0s

running (1m51.0s), 076/200 VUs, 5827 complete and 0 interrupted iterations
default   [  51% ] 076/200 VUs  1m46.1s/3m30.0s

running (1m52.0s), 078/200 VUs, 6012 complete and 0 interrupted iterations
default   [  51% ] 078/200 VUs  1m47.1s/3m30.0s

running (1m53.0s), 080/200 VUs, 6186 complete and 0 interrupted iterations
default   [  51% ] 080/200 VUs  1m48.1s/3m30.0s

running (1m54.0s), 081/200 VUs, 6377 complete and 0 interrupted iterations
default   [  52% ] 081/200 VUs  1m49.1s/3m30.0s

running (1m55.0s), 083/200 VUs, 6556 complete and 0 interrupted iterations
default   [  52% ] 083/200 VUs  1m50.1s/3m30.0s

running (1m56.0s), 085/200 VUs, 6756 complete and 0 interrupted iterations
default   [  53% ] 085/200 VUs  1m51.1s/3m30.0s

running (1m57.0s), 086/200 VUs, 6945 complete and 0 interrupted iterations
default   [  53% ] 086/200 VUs  1m52.1s/3m30.0s

running (1m58.0s), 088/200 VUs, 7143 complete and 0 interrupted iterations
default   [  54% ] 088/200 VUs  1m53.1s/3m30.0s

running (1m59.0s), 090/200 VUs, 7360 complete and 0 interrupted iterations
default   [  54% ] 090/200 VUs  1m54.1s/3m30.0s

running (2m00.0s), 091/200 VUs, 7565 complete and 0 interrupted iterations
default   [  55% ] 091/200 VUs  1m55.1s/3m30.0s

running (2m01.0s), 093/200 VUs, 7775 complete and 0 interrupted iterations
default   [  55% ] 093/200 VUs  1m56.1s/3m30.0s

running (2m02.0s), 095/200 VUs, 7984 complete and 0 interrupted iterations
default   [  56% ] 095/200 VUs  1m57.1s/3m30.0s

running (2m03.0s), 096/200 VUs, 8220 complete and 0 interrupted iterations
default   [  56% ] 096/200 VUs  1m58.1s/3m30.0s

running (2m04.0s), 098/200 VUs, 8424 complete and 0 interrupted iterations
default   [  57% ] 098/200 VUs  1m59.1s/3m30.0s

running (2m05.0s), 100/200 VUs, 8660 complete and 0 interrupted iterations
default   [  57% ] 100/200 VUs  2m00.1s/3m30.0s

running (2m06.0s), 101/200 VUs, 8894 complete and 0 interrupted iterations
default   [  58% ] 101/200 VUs  2m01.1s/3m30.0s

running (2m07.0s), 103/200 VUs, 9127 complete and 0 interrupted iterations
default   [  58% ] 103/200 VUs  2m02.1s/3m30.0s

running (2m08.0s), 105/200 VUs, 9367 complete and 0 interrupted iterations
default   [  59% ] 105/200 VUs  2m03.1s/3m30.0s

running (2m09.0s), 106/200 VUs, 9610 complete and 0 interrupted iterations
default   [  59% ] 106/200 VUs  2m04.1s/3m30.0s

running (2m10.0s), 108/200 VUs, 9855 complete and 0 interrupted iterations
default   [  60% ] 108/200 VUs  2m05.1s/3m30.0s

running (2m11.0s), 110/200 VUs, 10096 complete and 0 interrupted iterations
default   [  60% ] 110/200 VUs  2m06.1s/3m30.0s

running (2m12.0s), 111/200 VUs, 10360 complete and 0 interrupted iterations
default   [  61% ] 111/200 VUs  2m07.1s/3m30.0s

running (2m13.0s), 113/200 VUs, 10618 complete and 0 interrupted iterations
default   [  61% ] 113/200 VUs  2m08.1s/3m30.0s

running (2m14.0s), 115/200 VUs, 10871 complete and 0 interrupted iterations
default   [  61% ] 115/200 VUs  2m09.1s/3m30.0s
time="2026-05-28T17:23:10-03:00" level=warning msg="The test has generated metrics with 200291 unique time series, which is higher than the suggested limit of 100000 and could cause high memory usage. Consider not using high-cardinality values like unique IDs as metric tags or, if you need them in the URL, use the name metric tag or URL grouping. See https://grafana.com/docs/k6/latest/using-k6/tags-and-groups/ for details." component=metrics-engine-ingester

running (2m15.0s), 116/200 VUs, 11140 complete and 0 interrupted iterations
default   [  62% ] 116/200 VUs  2m10.1s/3m30.0s

running (2m16.0s), 118/200 VUs, 11397 complete and 0 interrupted iterations
default   [  62% ] 118/200 VUs  2m11.1s/3m30.0s

running (2m17.0s), 120/200 VUs, 11671 complete and 0 interrupted iterations
default   [  63% ] 120/200 VUs  2m12.1s/3m30.0s

running (2m18.0s), 121/200 VUs, 11941 complete and 0 interrupted iterations
default   [  63% ] 121/200 VUs  2m13.1s/3m30.0s

running (2m19.0s), 123/200 VUs, 12224 complete and 0 interrupted iterations
default   [  64% ] 123/200 VUs  2m14.1s/3m30.0s

running (2m20.0s), 125/200 VUs, 12518 complete and 0 interrupted iterations
default   [  64% ] 125/200 VUs  2m15.1s/3m30.0s

running (2m21.0s), 126/200 VUs, 12793 complete and 0 interrupted iterations
default   [  65% ] 126/200 VUs  2m16.1s/3m30.0s

running (2m22.0s), 128/200 VUs, 13078 complete and 0 interrupted iterations
default   [  65% ] 128/200 VUs  2m17.1s/3m30.0s

running (2m23.0s), 130/200 VUs, 13382 complete and 0 interrupted iterations
default   [  66% ] 130/200 VUs  2m18.1s/3m30.0s

running (2m24.0s), 131/200 VUs, 13681 complete and 0 interrupted iterations
default   [  66% ] 131/200 VUs  2m19.1s/3m30.0s

running (2m25.0s), 133/200 VUs, 13976 complete and 0 interrupted iterations
default   [  67% ] 133/200 VUs  2m20.1s/3m30.0s

running (2m26.0s), 135/200 VUs, 14273 complete and 0 interrupted iterations
default   [  67% ] 135/200 VUs  2m21.1s/3m30.0s

running (2m27.0s), 136/200 VUs, 14596 complete and 0 interrupted iterations
default   [  68% ] 136/200 VUs  2m22.1s/3m30.0s

running (2m28.0s), 138/200 VUs, 14906 complete and 0 interrupted iterations
default   [  68% ] 138/200 VUs  2m23.1s/3m30.0s

running (2m29.0s), 140/200 VUs, 15202 complete and 0 interrupted iterations
default   [  69% ] 140/200 VUs  2m24.1s/3m30.0s

running (2m30.0s), 141/200 VUs, 15518 complete and 0 interrupted iterations
default   [  69% ] 141/200 VUs  2m25.1s/3m30.0s

running (2m31.0s), 143/200 VUs, 15841 complete and 0 interrupted iterations
default   [  70% ] 143/200 VUs  2m26.1s/3m30.0s

running (2m32.0s), 145/200 VUs, 16172 complete and 0 interrupted iterations
default   [  70% ] 145/200 VUs  2m27.1s/3m30.0s

running (2m33.0s), 146/200 VUs, 16508 complete and 0 interrupted iterations
default   [  71% ] 146/200 VUs  2m28.1s/3m30.0s

running (2m34.0s), 148/200 VUs, 16834 complete and 0 interrupted iterations
default   [  71% ] 148/200 VUs  2m29.1s/3m30.0s

running (2m35.0s), 150/200 VUs, 17176 complete and 0 interrupted iterations
default   [  71% ] 150/200 VUs  2m30.1s/3m30.0s

running (2m36.0s), 151/200 VUs, 17516 complete and 0 interrupted iterations
default   [  72% ] 151/200 VUs  2m31.1s/3m30.0s

running (2m37.0s), 153/200 VUs, 17863 complete and 0 interrupted iterations
default   [  72% ] 153/200 VUs  2m32.1s/3m30.0s

running (2m38.0s), 155/200 VUs, 18202 complete and 0 interrupted iterations
default   [  73% ] 155/200 VUs  2m33.1s/3m30.0s

running (2m39.0s), 156/200 VUs, 18546 complete and 0 interrupted iterations
default   [  73% ] 156/200 VUs  2m34.1s/3m30.0s

running (2m40.0s), 158/200 VUs, 18910 complete and 0 interrupted iterations
default   [  74% ] 158/200 VUs  2m35.1s/3m30.0s

running (2m41.0s), 160/200 VUs, 19267 complete and 0 interrupted iterations
default   [  74% ] 160/200 VUs  2m36.1s/3m30.0s

running (2m42.0s), 161/200 VUs, 19633 complete and 0 interrupted iterations
default   [  75% ] 161/200 VUs  2m37.1s/3m30.0s

running (2m43.0s), 163/200 VUs, 19988 complete and 0 interrupted iterations
default   [  75% ] 163/200 VUs  2m38.1s/3m30.0s

running (2m44.0s), 165/200 VUs, 20354 complete and 0 interrupted iterations
default   [  76% ] 165/200 VUs  2m39.1s/3m30.0s

running (2m45.0s), 166/200 VUs, 20719 complete and 0 interrupted iterations
default   [  76% ] 166/200 VUs  2m40.1s/3m30.0s

running (2m46.0s), 168/200 VUs, 21097 complete and 0 interrupted iterations
default   [  77% ] 168/200 VUs  2m41.1s/3m30.0s

running (2m47.0s), 170/200 VUs, 21471 complete and 0 interrupted iterations
default   [  77% ] 170/200 VUs  2m42.1s/3m30.0s

running (2m48.0s), 171/200 VUs, 21838 complete and 0 interrupted iterations
default   [  78% ] 171/200 VUs  2m43.1s/3m30.0s
time="2026-05-28T17:23:44-03:00" level=warning msg="The test has generated metrics with 400127 unique time series, which is higher than the suggested limit of 100000 and could cause high memory usage. Consider not using high-cardinality values like unique IDs as metric tags or, if you need them in the URL, use the name metric tag or URL grouping. See https://grafana.com/docs/k6/latest/using-k6/tags-and-groups/ for details." component=metrics-engine-ingester

running (2m49.0s), 173/200 VUs, 22220 complete and 0 interrupted iterations
default   [  78% ] 173/200 VUs  2m44.1s/3m30.0s

running (2m50.0s), 175/200 VUs, 22610 complete and 0 interrupted iterations
default   [  79% ] 175/200 VUs  2m45.1s/3m30.0s

running (2m51.0s), 176/200 VUs, 23016 complete and 0 interrupted iterations
default   [  79% ] 176/200 VUs  2m46.1s/3m30.0s

running (2m52.0s), 178/200 VUs, 23411 complete and 0 interrupted iterations
default   [  80% ] 178/200 VUs  2m47.1s/3m30.0s

running (2m53.0s), 180/200 VUs, 23799 complete and 0 interrupted iterations
default   [  80% ] 180/200 VUs  2m48.1s/3m30.0s

running (2m54.0s), 181/200 VUs, 24199 complete and 0 interrupted iterations
default   [  81% ] 181/200 VUs  2m49.1s/3m30.0s

running (2m55.0s), 183/200 VUs, 24605 complete and 0 interrupted iterations
default   [  81% ] 183/200 VUs  2m50.1s/3m30.0s

running (2m56.0s), 185/200 VUs, 24983 complete and 0 interrupted iterations
default   [  81% ] 185/200 VUs  2m51.1s/3m30.0s

running (2m57.0s), 186/200 VUs, 25382 complete and 0 interrupted iterations
default   [  82% ] 186/200 VUs  2m52.1s/3m30.0s

running (2m58.0s), 188/200 VUs, 25764 complete and 0 interrupted iterations
default   [  82% ] 188/200 VUs  2m53.1s/3m30.0s

running (2m59.0s), 190/200 VUs, 26170 complete and 0 interrupted iterations
default   [  83% ] 190/200 VUs  2m54.1s/3m30.0s

running (3m00.0s), 191/200 VUs, 26580 complete and 0 interrupted iterations
default   [  83% ] 191/200 VUs  2m55.1s/3m30.0s

running (3m01.0s), 193/200 VUs, 27000 complete and 0 interrupted iterations
default   [  84% ] 193/200 VUs  2m56.1s/3m30.0s

running (3m02.0s), 195/200 VUs, 27429 complete and 0 interrupted iterations
default   [  84% ] 195/200 VUs  2m57.1s/3m30.0s

running (3m03.0s), 196/200 VUs, 27852 complete and 0 interrupted iterations
default   [  85% ] 196/200 VUs  2m58.1s/3m30.0s

running (3m04.0s), 198/200 VUs, 28274 complete and 0 interrupted iterations
default   [  85% ] 198/200 VUs  2m59.1s/3m30.0s

running (3m05.0s), 200/200 VUs, 28662 complete and 0 interrupted iterations
default   [  86% ] 200/200 VUs  3m00.1s/3m30.0s

running (3m06.0s), 195/200 VUs, 29085 complete and 0 interrupted iterations
default   [  86% ] 195/200 VUs  3m01.1s/3m30.0s

running (3m07.0s), 188/200 VUs, 29516 complete and 0 interrupted iterations
default   [  87% ] 188/200 VUs  3m02.1s/3m30.0s

running (3m08.0s), 182/200 VUs, 29936 complete and 0 interrupted iterations
default   [  87% ] 182/200 VUs  3m03.1s/3m30.0s

running (3m09.0s), 175/200 VUs, 30331 complete and 0 interrupted iterations
default   [  88% ] 175/200 VUs  3m04.1s/3m30.0s

running (3m10.0s), 168/200 VUs, 30715 complete and 0 interrupted iterations
default   [  88% ] 168/200 VUs  3m05.1s/3m30.0s

running (3m11.0s), 162/200 VUs, 31090 complete and 0 interrupted iterations
default   [  89% ] 162/200 VUs  3m06.1s/3m30.0s

running (3m12.0s), 154/200 VUs, 31455 complete and 0 interrupted iterations
default   [  89% ] 154/200 VUs  3m07.1s/3m30.0s

running (3m13.0s), 147/200 VUs, 31803 complete and 0 interrupted iterations
default   [  90% ] 147/200 VUs  3m08.1s/3m30.0s

running (3m14.0s), 141/200 VUs, 32117 complete and 0 interrupted iterations
default   [  90% ] 141/200 VUs  3m09.1s/3m30.0s

running (3m15.0s), 135/200 VUs, 32429 complete and 0 interrupted iterations
default   [  91% ] 135/200 VUs  3m10.1s/3m30.0s

running (3m16.0s), 128/200 VUs, 32740 complete and 0 interrupted iterations
default   [  91% ] 128/200 VUs  3m11.1s/3m30.0s

running (3m17.0s), 122/200 VUs, 33027 complete and 0 interrupted iterations
default   [  91% ] 122/200 VUs  3m12.1s/3m30.0s

running (3m18.0s), 115/200 VUs, 33291 complete and 0 interrupted iterations
default   [  92% ] 115/200 VUs  3m13.1s/3m30.0s

running (3m19.0s), 109/200 VUs, 33539 complete and 0 interrupted iterations
default   [  92% ] 109/200 VUs  3m14.1s/3m30.0s

running (3m20.0s), 100/200 VUs, 33792 complete and 0 interrupted iterations
default   [  93% ] 100/200 VUs  3m15.1s/3m30.0s

running (3m21.0s), 094/200 VUs, 34024 complete and 0 interrupted iterations
default   [  93% ] 094/200 VUs  3m16.1s/3m30.0s

running (3m22.0s), 088/200 VUs, 34229 complete and 0 interrupted iterations
default   [  94% ] 088/200 VUs  3m17.1s/3m30.0s

running (3m23.0s), 080/200 VUs, 34434 complete and 0 interrupted iterations
default   [  94% ] 080/200 VUs  3m18.1s/3m30.0s

running (3m24.0s), 074/200 VUs, 34621 complete and 0 interrupted iterations
default   [  95% ] 074/200 VUs  3m19.1s/3m30.0s

running (3m25.0s), 066/200 VUs, 34780 complete and 0 interrupted iterations
default   [  95% ] 066/200 VUs  3m20.1s/3m30.0s

running (3m26.0s), 062/200 VUs, 34938 complete and 0 interrupted iterations
default   [  96% ] 062/200 VUs  3m21.1s/3m30.0s

running (3m27.0s), 054/200 VUs, 35075 complete and 0 interrupted iterations
default   [  96% ] 054/200 VUs  3m22.1s/3m30.0s

running (3m28.0s), 048/200 VUs, 35186 complete and 0 interrupted iterations
default   [  97% ] 048/200 VUs  3m23.1s/3m30.0s

running (3m29.0s), 042/200 VUs, 35287 complete and 0 interrupted iterations
default   [  97% ] 042/200 VUs  3m24.1s/3m30.0s

running (3m30.0s), 033/200 VUs, 35382 complete and 0 interrupted iterations
default   [  98% ] 033/200 VUs  3m25.1s/3m30.0s

running (3m31.0s), 027/200 VUs, 35457 complete and 0 interrupted iterations
default   [  98% ] 027/200 VUs  3m26.1s/3m30.0s

running (3m32.0s), 020/200 VUs, 35510 complete and 0 interrupted iterations
default   [  99% ] 020/200 VUs  3m27.1s/3m30.0s

running (3m33.0s), 015/200 VUs, 35548 complete and 0 interrupted iterations
default   [  99% ] 015/200 VUs  3m28.1s/3m30.0s

running (3m34.0s), 008/200 VUs, 35576 complete and 0 interrupted iterations
default   [ 100% ] 008/200 VUs  3m29.1s/3m30.0s

running (3m35.0s), 001/200 VUs, 35590 complete and 0 interrupted iterations
default ↓ [ 100% ] 001/200 VUs  3m30s


  █ THRESHOLDS 

    http_req_duration
    ✓ 'p(95)<5000' p(95)=29.55ms

    http_req_failed
    ✓ 'rate<0.1' rate=0.00%


  █ TOTAL RESULTS 

    checks_total.......: 142564  662.790345/s
    checks_succeeded...: 100.00% 142564 out of 142564
    checks_failed......: 0.00%   0 out of 142564

    ✓ register 201
    ✓ login 200
    ✓ create 201
    ✓ create retorna id
    ✓ update 200
    ✓ delete 204

    HTTP
    http_req_duration..............: avg=15.19ms  min=3.26ms   med=13.43ms  max=173.87ms p(90)=23.09ms  p(95)=29.55ms 
      { expected_response:true }...: avg=15.19ms  min=3.26ms   med=13.43ms  max=173.87ms p(90)=23.09ms  p(95)=29.55ms 
    http_req_failed................: 0.00%  0 out of 106973
    http_reqs......................: 106973 497.325212/s

    EXECUTION
    iteration_duration.............: avg=446.29ms min=412.07ms med=442.74ms max=608.55ms p(90)=467.77ms p(95)=481.97ms
    iterations.....................: 35591  165.465133/s
    vus............................: 1      min=0           max=200
    vus_max........................: 200    min=200         max=200

    NETWORK
    data_received..................: 54 MB  249 kB/s
    data_sent......................: 53 MB  244 kB/s




running (3m35.1s), 000/200 VUs, 35591 complete and 0 interrupted iterations
default ✓ [ 100% ] 000/200 VUs  3m30s

================================================================
% cd DomainCommunity/messageRest && k6 run messageRest-load.js
================================================================


         /\      Grafana   /‾‾/  
    /\  /  \     |\  __   /  /   
   /  \/    \    | |/ /  /   ‾‾\ 
  /          \   |   (  |  (‾)  |
 / __________ \  |_|\_\  \_____/ 


     execution: local
        script: messageRest-load.js
        output: -

     scenarios: (100.00%) 2 scenarios, 120 max VUs, 2m30s max duration (incl. graceful stop):
              * listing: 80 looping VUs for 2m0s (exec: listMessages, gracefulStop: 30s)
              * sync: 40 looping VUs for 2m0s (exec: syncMessages, gracefulStop: 30s)


Run       [ 100% ] setup()
listing   [   0% ]
sync      [   0% ]

Run       [ 100% ] setup()
listing   [   0% ]
sync      [   0% ]

Run       [ 100% ] setup()
listing   [   0% ]
sync      [   0% ]

Run       [ 100% ] setup()
listing   [   0% ]
sync      [   0% ]

Run       [ 100% ] setup()
listing   [   0% ]
sync      [   0% ]

Run       [ 100% ] setup()
listing   [   0% ]
sync      [   0% ]

Run       [ 100% ] setup()
listing   [   0% ]
sync      [   0% ]

Run       [ 100% ] setup()
listing   [   0% ]
sync      [   0% ]

Run       [ 100% ] setup()
listing   [   0% ]
sync      [   0% ]

Run       [ 100% ] setup()
listing   [   0% ]
sync      [   0% ]

Run       [ 100% ] setup()
listing   [   0% ]
sync      [   0% ]

Run       [ 100% ] setup()
listing   [   0% ]
sync      [   0% ]

Run       [ 100% ] setup()
listing   [   0% ]
sync      [   0% ]

Run       [ 100% ] setup()
listing   [   0% ]
sync      [   0% ]

Run       [ 100% ] setup()
listing   [   0% ]
sync      [   0% ]

Run       [ 100% ] setup()
listing   [   0% ]
sync      [   0% ]

Run       [ 100% ] setup()
listing   [   0% ]
sync      [   0% ]

Run       [ 100% ] setup()
listing   [   0% ]
sync      [   0% ]

Run       [ 100% ] setup()
listing   [   0% ]
sync      [   0% ]

Run       [ 100% ] setup()
listing   [   0% ]
sync      [   0% ]

Run       [ 100% ] setup()
listing   [   0% ]
sync      [   0% ]

Run       [ 100% ] setup()
listing   [   0% ]
sync      [   0% ]

Run       [ 100% ] setup()
listing   [   0% ]
sync      [   0% ]

Run       [ 100% ] setup()
listing   [   0% ]
sync      [   0% ]

Run       [ 100% ] setup()
listing   [   0% ]
sync      [   0% ]

Run       [ 100% ] setup()
listing   [   0% ]
sync      [   0% ]

Run       [ 100% ] setup()
listing   [   0% ]
sync      [   0% ]

Run       [ 100% ] setup()
listing   [   0% ]
sync      [   0% ]

Run       [ 100% ] setup()
listing   [   0% ]
sync      [   0% ]

Run       [ 100% ] setup()
listing   [   0% ]
sync      [   0% ]

Run       [ 100% ] setup()
listing   [   0% ]
sync      [   0% ]

running (0m32.0s), 120/120 VUs, 34 complete and 0 interrupted iterations
listing   [   1% ] 80 VUs  0m01.0s/2m0s
sync      [   1% ] 40 VUs  0m01.0s/2m0s

running (0m33.0s), 120/120 VUs, 200 complete and 0 interrupted iterations
listing   [   2% ] 80 VUs  0m02.0s/2m0s
sync      [   2% ] 40 VUs  0m02.0s/2m0s

running (0m34.0s), 120/120 VUs, 320 complete and 0 interrupted iterations
listing   [   2% ] 80 VUs  0m03.0s/2m0s
sync      [   2% ] 40 VUs  0m03.0s/2m0s

running (0m35.0s), 120/120 VUs, 440 complete and 0 interrupted iterations
listing   [   3% ] 80 VUs  0m04.0s/2m0s
sync      [   3% ] 40 VUs  0m04.0s/2m0s

running (0m36.0s), 120/120 VUs, 560 complete and 0 interrupted iterations
listing   [   4% ] 80 VUs  0m05.0s/2m0s
sync      [   4% ] 40 VUs  0m05.0s/2m0s

running (0m37.0s), 120/120 VUs, 680 complete and 0 interrupted iterations
listing   [   5% ] 80 VUs  0m06.0s/2m0s
sync      [   5% ] 40 VUs  0m06.0s/2m0s

running (0m38.0s), 120/120 VUs, 800 complete and 0 interrupted iterations
listing   [   6% ] 80 VUs  0m07.0s/2m0s
sync      [   6% ] 40 VUs  0m07.0s/2m0s

running (0m39.0s), 120/120 VUs, 920 complete and 0 interrupted iterations
listing   [   7% ] 80 VUs  0m08.0s/2m0s
sync      [   7% ] 40 VUs  0m08.0s/2m0s

running (0m40.0s), 120/120 VUs, 1040 complete and 0 interrupted iterations
listing   [   7% ] 80 VUs  0m09.0s/2m0s
sync      [   7% ] 40 VUs  0m09.0s/2m0s

running (0m41.0s), 120/120 VUs, 1180 complete and 0 interrupted iterations
listing   [   8% ] 80 VUs  0m10.0s/2m0s
sync      [   8% ] 40 VUs  0m10.0s/2m0s

running (0m42.0s), 120/120 VUs, 1340 complete and 0 interrupted iterations
listing   [   9% ] 80 VUs  0m11.0s/2m0s
sync      [   9% ] 40 VUs  0m11.0s/2m0s

running (0m43.0s), 120/120 VUs, 1480 complete and 0 interrupted iterations
listing   [  10% ] 80 VUs  0m12.0s/2m0s
sync      [  10% ] 40 VUs  0m12.0s/2m0s

running (0m44.0s), 120/120 VUs, 1600 complete and 0 interrupted iterations
listing   [  11% ] 80 VUs  0m13.0s/2m0s
sync      [  11% ] 40 VUs  0m13.0s/2m0s

running (0m45.0s), 120/120 VUs, 1720 complete and 0 interrupted iterations
listing   [  12% ] 80 VUs  0m14.0s/2m0s
sync      [  12% ] 40 VUs  0m14.0s/2m0s

running (0m46.0s), 120/120 VUs, 1840 complete and 0 interrupted iterations
listing   [  12% ] 80 VUs  0m15.0s/2m0s
sync      [  12% ] 40 VUs  0m15.0s/2m0s

running (0m47.0s), 120/120 VUs, 1960 complete and 0 interrupted iterations
listing   [  13% ] 80 VUs  0m16.0s/2m0s
sync      [  13% ] 40 VUs  0m16.0s/2m0s

running (0m48.0s), 120/120 VUs, 2080 complete and 0 interrupted iterations
listing   [  14% ] 80 VUs  0m17.0s/2m0s
sync      [  14% ] 40 VUs  0m17.0s/2m0s

running (0m49.0s), 120/120 VUs, 2200 complete and 0 interrupted iterations
listing   [  15% ] 80 VUs  0m18.0s/2m0s
sync      [  15% ] 40 VUs  0m18.0s/2m0s

running (0m50.0s), 120/120 VUs, 2340 complete and 0 interrupted iterations
listing   [  16% ] 80 VUs  0m19.0s/2m0s
sync      [  16% ] 40 VUs  0m19.0s/2m0s

running (0m51.0s), 120/120 VUs, 2498 complete and 0 interrupted iterations
listing   [  17% ] 80 VUs  0m20.0s/2m0s
sync      [  17% ] 40 VUs  0m20.0s/2m0s

running (0m52.0s), 120/120 VUs, 2640 complete and 0 interrupted iterations
listing   [  17% ] 80 VUs  0m21.0s/2m0s
sync      [  17% ] 40 VUs  0m21.0s/2m0s

running (0m53.0s), 120/120 VUs, 2760 complete and 0 interrupted iterations
listing   [  18% ] 80 VUs  0m22.0s/2m0s
sync      [  18% ] 40 VUs  0m22.0s/2m0s

running (0m54.0s), 120/120 VUs, 2880 complete and 0 interrupted iterations
listing   [  19% ] 80 VUs  0m23.0s/2m0s
sync      [  19% ] 40 VUs  0m23.0s/2m0s

running (0m55.0s), 120/120 VUs, 3000 complete and 0 interrupted iterations
listing   [  20% ] 80 VUs  0m24.0s/2m0s
sync      [  20% ] 40 VUs  0m24.0s/2m0s

running (0m56.0s), 120/120 VUs, 3120 complete and 0 interrupted iterations
listing   [  21% ] 80 VUs  0m25.0s/2m0s
sync      [  21% ] 40 VUs  0m25.0s/2m0s

running (0m57.0s), 120/120 VUs, 3240 complete and 0 interrupted iterations
listing   [  22% ] 80 VUs  0m26.0s/2m0s
sync      [  22% ] 40 VUs  0m26.0s/2m0s

running (0m58.0s), 120/120 VUs, 3360 complete and 0 interrupted iterations
listing   [  22% ] 80 VUs  0m27.0s/2m0s
sync      [  22% ] 40 VUs  0m27.0s/2m0s

running (0m59.0s), 120/120 VUs, 3500 complete and 0 interrupted iterations
listing   [  23% ] 80 VUs  0m28.0s/2m0s
sync      [  23% ] 40 VUs  0m28.0s/2m0s

running (1m00.0s), 120/120 VUs, 3680 complete and 0 interrupted iterations
listing   [  24% ] 80 VUs  0m29.0s/2m0s
sync      [  24% ] 40 VUs  0m29.0s/2m0s

running (1m01.0s), 120/120 VUs, 3800 complete and 0 interrupted iterations
listing   [  25% ] 80 VUs  0m30.0s/2m0s
sync      [  25% ] 40 VUs  0m30.0s/2m0s

running (1m02.0s), 120/120 VUs, 3920 complete and 0 interrupted iterations
listing   [  26% ] 80 VUs  0m31.0s/2m0s
sync      [  26% ] 40 VUs  0m31.0s/2m0s

running (1m03.0s), 120/120 VUs, 4040 complete and 0 interrupted iterations
listing   [  27% ] 80 VUs  0m32.0s/2m0s
sync      [  27% ] 40 VUs  0m32.0s/2m0s

running (1m04.0s), 120/120 VUs, 4160 complete and 0 interrupted iterations
listing   [  27% ] 80 VUs  0m33.0s/2m0s
sync      [  27% ] 40 VUs  0m33.0s/2m0s

running (1m05.0s), 120/120 VUs, 4280 complete and 0 interrupted iterations
listing   [  28% ] 80 VUs  0m34.0s/2m0s
sync      [  28% ] 40 VUs  0m34.0s/2m0s

running (1m06.0s), 120/120 VUs, 4388 complete and 0 interrupted iterations
listing   [  29% ] 80 VUs  0m35.0s/2m0s
sync      [  29% ] 40 VUs  0m35.0s/2m0s

running (1m07.0s), 120/120 VUs, 4505 complete and 0 interrupted iterations
listing   [  30% ] 80 VUs  0m36.0s/2m0s
sync      [  30% ] 40 VUs  0m36.0s/2m0s

running (1m08.0s), 120/120 VUs, 4625 complete and 0 interrupted iterations
listing   [  31% ] 80 VUs  0m37.0s/2m0s
sync      [  31% ] 40 VUs  0m37.0s/2m0s

running (1m09.0s), 120/120 VUs, 4769 complete and 0 interrupted iterations
listing   [  32% ] 80 VUs  0m38.0s/2m0s
sync      [  32% ] 40 VUs  0m38.0s/2m0s

running (1m10.0s), 120/120 VUs, 4929 complete and 0 interrupted iterations
listing   [  32% ] 80 VUs  0m39.0s/2m0s
sync      [  32% ] 40 VUs  0m39.0s/2m0s

running (1m11.0s), 120/120 VUs, 5049 complete and 0 interrupted iterations
listing   [  33% ] 80 VUs  0m40.0s/2m0s
sync      [  33% ] 40 VUs  0m40.0s/2m0s

running (1m12.0s), 120/120 VUs, 5160 complete and 0 interrupted iterations
listing   [  34% ] 80 VUs  0m41.0s/2m0s
sync      [  34% ] 40 VUs  0m41.0s/2m0s

running (1m13.0s), 120/120 VUs, 5280 complete and 0 interrupted iterations
listing   [  35% ] 80 VUs  0m42.0s/2m0s
sync      [  35% ] 40 VUs  0m42.0s/2m0s

running (1m14.0s), 120/120 VUs, 5400 complete and 0 interrupted iterations
listing   [  36% ] 80 VUs  0m43.0s/2m0s
sync      [  36% ] 40 VUs  0m43.0s/2m0s

running (1m15.0s), 120/120 VUs, 5520 complete and 0 interrupted iterations
listing   [  37% ] 80 VUs  0m44.0s/2m0s
sync      [  37% ] 40 VUs  0m44.0s/2m0s

running (1m16.0s), 120/120 VUs, 5640 complete and 0 interrupted iterations
listing   [  37% ] 80 VUs  0m45.0s/2m0s
sync      [  37% ] 40 VUs  0m45.0s/2m0s

running (1m17.0s), 120/120 VUs, 5782 complete and 0 interrupted iterations
listing   [  38% ] 80 VUs  0m46.0s/2m0s
sync      [  38% ] 40 VUs  0m46.0s/2m0s

running (1m18.0s), 120/120 VUs, 5939 complete and 0 interrupted iterations
listing   [  39% ] 80 VUs  0m47.0s/2m0s
sync      [  39% ] 40 VUs  0m47.0s/2m0s

running (1m19.0s), 120/120 VUs, 6080 complete and 0 interrupted iterations
listing   [  40% ] 80 VUs  0m48.0s/2m0s
sync      [  40% ] 40 VUs  0m48.0s/2m0s

running (1m20.0s), 120/120 VUs, 6200 complete and 0 interrupted iterations
listing   [  41% ] 80 VUs  0m49.0s/2m0s
sync      [  41% ] 40 VUs  0m49.0s/2m0s

running (1m21.0s), 120/120 VUs, 6320 complete and 0 interrupted iterations
listing   [  42% ] 80 VUs  0m50.0s/2m0s
sync      [  42% ] 40 VUs  0m50.0s/2m0s

running (1m22.0s), 120/120 VUs, 6440 complete and 0 interrupted iterations
listing   [  42% ] 80 VUs  0m51.0s/2m0s
sync      [  42% ] 40 VUs  0m51.0s/2m0s

running (1m23.0s), 120/120 VUs, 6560 complete and 0 interrupted iterations
listing   [  43% ] 80 VUs  0m52.0s/2m0s
sync      [  43% ] 40 VUs  0m52.0s/2m0s

running (1m24.0s), 120/120 VUs, 6680 complete and 0 interrupted iterations
listing   [  44% ] 80 VUs  0m53.0s/2m0s
sync      [  44% ] 40 VUs  0m53.0s/2m0s

running (1m25.0s), 120/120 VUs, 6808 complete and 0 interrupted iterations
listing   [  45% ] 80 VUs  0m54.0s/2m0s
sync      [  45% ] 40 VUs  0m54.0s/2m0s

running (1m26.0s), 120/120 VUs, 6979 complete and 0 interrupted iterations
listing   [  46% ] 80 VUs  0m55.0s/2m0s
sync      [  46% ] 40 VUs  0m55.0s/2m0s

running (1m27.0s), 120/120 VUs, 7120 complete and 0 interrupted iterations
listing   [  47% ] 80 VUs  0m56.0s/2m0s
sync      [  47% ] 40 VUs  0m56.0s/2m0s

running (1m28.0s), 120/120 VUs, 7240 complete and 0 interrupted iterations
listing   [  47% ] 80 VUs  0m57.0s/2m0s
sync      [  47% ] 40 VUs  0m57.0s/2m0s

running (1m29.0s), 120/120 VUs, 7360 complete and 0 interrupted iterations
listing   [  48% ] 80 VUs  0m58.0s/2m0s
sync      [  48% ] 40 VUs  0m58.0s/2m0s

running (1m30.0s), 120/120 VUs, 7480 complete and 0 interrupted iterations
listing   [  49% ] 80 VUs  0m59.0s/2m0s
sync      [  49% ] 40 VUs  0m59.0s/2m0s

running (1m31.0s), 120/120 VUs, 7600 complete and 0 interrupted iterations
listing   [  50% ] 80 VUs  1m00.0s/2m0s
sync      [  50% ] 40 VUs  1m00.0s/2m0s

running (1m32.0s), 120/120 VUs, 7720 complete and 0 interrupted iterations
listing   [  51% ] 80 VUs  1m01.0s/2m0s
sync      [  51% ] 40 VUs  1m01.0s/2m0s

running (1m33.0s), 120/120 VUs, 7840 complete and 0 interrupted iterations
listing   [  52% ] 80 VUs  1m02.0s/2m0s
sync      [  52% ] 40 VUs  1m02.0s/2m0s

running (1m34.0s), 120/120 VUs, 7985 complete and 0 interrupted iterations
listing   [  52% ] 80 VUs  1m03.0s/2m0s
sync      [  52% ] 40 VUs  1m03.0s/2m0s

running (1m35.0s), 120/120 VUs, 8143 complete and 0 interrupted iterations
listing   [  53% ] 80 VUs  1m04.0s/2m0s
sync      [  53% ] 40 VUs  1m04.0s/2m0s

running (1m36.0s), 120/120 VUs, 8280 complete and 0 interrupted iterations
listing   [  54% ] 80 VUs  1m05.0s/2m0s
sync      [  54% ] 40 VUs  1m05.0s/2m0s

running (1m37.0s), 120/120 VUs, 8400 complete and 0 interrupted iterations
listing   [  55% ] 80 VUs  1m06.0s/2m0s
sync      [  55% ] 40 VUs  1m06.0s/2m0s

running (1m38.0s), 120/120 VUs, 8520 complete and 0 interrupted iterations
listing   [  56% ] 80 VUs  1m07.0s/2m0s
sync      [  56% ] 40 VUs  1m07.0s/2m0s

running (1m39.0s), 120/120 VUs, 8640 complete and 0 interrupted iterations
listing   [  57% ] 80 VUs  1m08.0s/2m0s
sync      [  57% ] 40 VUs  1m08.0s/2m0s

running (1m40.0s), 120/120 VUs, 8760 complete and 0 interrupted iterations
listing   [  57% ] 80 VUs  1m09.0s/2m0s
sync      [  57% ] 40 VUs  1m09.0s/2m0s

running (1m41.0s), 120/120 VUs, 8880 complete and 0 interrupted iterations
listing   [  58% ] 80 VUs  1m10.0s/2m0s
sync      [  58% ] 40 VUs  1m10.0s/2m0s

running (1m42.0s), 120/120 VUs, 9000 complete and 0 interrupted iterations
listing   [  59% ] 80 VUs  1m11.0s/2m0s
sync      [  59% ] 40 VUs  1m11.0s/2m0s

running (1m43.0s), 120/120 VUs, 9140 complete and 0 interrupted iterations
listing   [  60% ] 80 VUs  1m12.0s/2m0s
sync      [  60% ] 40 VUs  1m12.0s/2m0s

running (1m44.0s), 120/120 VUs, 9299 complete and 0 interrupted iterations
listing   [  61% ] 80 VUs  1m13.0s/2m0s
sync      [  61% ] 40 VUs  1m13.0s/2m0s

running (1m45.0s), 120/120 VUs, 9440 complete and 0 interrupted iterations
listing   [  62% ] 80 VUs  1m14.0s/2m0s
sync      [  62% ] 40 VUs  1m14.0s/2m0s

running (1m46.0s), 120/120 VUs, 9560 complete and 0 interrupted iterations
listing   [  62% ] 80 VUs  1m15.0s/2m0s
sync      [  62% ] 40 VUs  1m15.0s/2m0s

running (1m47.0s), 120/120 VUs, 9680 complete and 0 interrupted iterations
listing   [  63% ] 80 VUs  1m16.0s/2m0s
sync      [  63% ] 40 VUs  1m16.0s/2m0s

running (1m48.0s), 120/120 VUs, 9800 complete and 0 interrupted iterations
listing   [  64% ] 80 VUs  1m17.0s/2m0s
sync      [  64% ] 40 VUs  1m17.0s/2m0s

running (1m49.0s), 120/120 VUs, 9920 complete and 0 interrupted iterations
listing   [  65% ] 80 VUs  1m18.0s/2m0s
sync      [  65% ] 40 VUs  1m18.0s/2m0s

running (1m50.0s), 120/120 VUs, 10040 complete and 0 interrupted iterations
listing   [  66% ] 80 VUs  1m19.0s/2m0s
sync      [  66% ] 40 VUs  1m19.0s/2m0s

running (1m51.0s), 120/120 VUs, 10160 complete and 0 interrupted iterations
listing   [  67% ] 80 VUs  1m20.0s/2m0s
sync      [  67% ] 40 VUs  1m20.0s/2m0s

running (1m52.0s), 120/120 VUs, 10320 complete and 0 interrupted iterations
listing   [  67% ] 80 VUs  1m21.0s/2m0s
sync      [  67% ] 40 VUs  1m21.0s/2m0s

running (1m53.0s), 120/120 VUs, 10480 complete and 0 interrupted iterations
listing   [  68% ] 80 VUs  1m22.0s/2m0s
sync      [  68% ] 40 VUs  1m22.0s/2m0s

running (1m54.0s), 120/120 VUs, 10599 complete and 0 interrupted iterations
listing   [  69% ] 80 VUs  1m23.0s/2m0s
sync      [  69% ] 40 VUs  1m23.0s/2m0s

running (1m55.0s), 120/120 VUs, 10713 complete and 0 interrupted iterations
listing   [  70% ] 80 VUs  1m24.0s/2m0s
sync      [  70% ] 40 VUs  1m24.0s/2m0s

running (1m56.0s), 120/120 VUs, 10820 complete and 0 interrupted iterations
listing   [  71% ] 80 VUs  1m25.0s/2m0s
sync      [  71% ] 40 VUs  1m25.0s/2m0s

running (1m57.0s), 120/120 VUs, 10937 complete and 0 interrupted iterations
listing   [  72% ] 80 VUs  1m26.0s/2m0s
sync      [  72% ] 40 VUs  1m26.0s/2m0s

running (1m58.0s), 120/120 VUs, 11057 complete and 0 interrupted iterations
listing   [  72% ] 80 VUs  1m27.0s/2m0s
sync      [  72% ] 40 VUs  1m27.0s/2m0s

running (1m59.0s), 120/120 VUs, 11172 complete and 0 interrupted iterations
listing   [  73% ] 80 VUs  1m28.0s/2m0s
sync      [  73% ] 40 VUs  1m28.0s/2m0s

running (2m00.0s), 120/120 VUs, 11290 complete and 0 interrupted iterations
listing   [  74% ] 80 VUs  1m29.0s/2m0s
sync      [  74% ] 40 VUs  1m29.0s/2m0s

running (2m01.0s), 120/120 VUs, 11439 complete and 0 interrupted iterations
listing   [  75% ] 80 VUs  1m30.0s/2m0s
sync      [  75% ] 40 VUs  1m30.0s/2m0s

running (2m02.0s), 120/120 VUs, 11600 complete and 0 interrupted iterations
listing   [  76% ] 80 VUs  1m31.0s/2m0s
sync      [  76% ] 40 VUs  1m31.0s/2m0s

running (2m03.0s), 120/120 VUs, 11720 complete and 0 interrupted iterations
listing   [  77% ] 80 VUs  1m32.0s/2m0s
sync      [  77% ] 40 VUs  1m32.0s/2m0s

running (2m04.0s), 120/120 VUs, 11840 complete and 0 interrupted iterations
listing   [  77% ] 80 VUs  1m33.0s/2m0s
sync      [  77% ] 40 VUs  1m33.0s/2m0s

running (2m05.0s), 120/120 VUs, 11960 complete and 0 interrupted iterations
listing   [  78% ] 80 VUs  1m34.0s/2m0s
sync      [  78% ] 40 VUs  1m34.0s/2m0s

running (2m06.0s), 120/120 VUs, 12080 complete and 0 interrupted iterations
listing   [  79% ] 80 VUs  1m35.0s/2m0s
sync      [  79% ] 40 VUs  1m35.0s/2m0s

running (2m07.0s), 120/120 VUs, 12200 complete and 0 interrupted iterations
listing   [  80% ] 80 VUs  1m36.0s/2m0s
sync      [  80% ] 40 VUs  1m36.0s/2m0s

running (2m08.0s), 120/120 VUs, 12320 complete and 0 interrupted iterations
listing   [  81% ] 80 VUs  1m37.0s/2m0s
sync      [  81% ] 40 VUs  1m37.0s/2m0s

running (2m09.0s), 120/120 VUs, 12460 complete and 0 interrupted iterations
listing   [  82% ] 80 VUs  1m38.0s/2m0s
sync      [  82% ] 40 VUs  1m38.0s/2m0s

running (2m10.0s), 120/120 VUs, 12614 complete and 0 interrupted iterations
listing   [  82% ] 80 VUs  1m39.0s/2m0s
sync      [  82% ] 40 VUs  1m39.0s/2m0s

running (2m11.0s), 120/120 VUs, 12760 complete and 0 interrupted iterations
listing   [  83% ] 80 VUs  1m40.0s/2m0s
sync      [  83% ] 40 VUs  1m40.0s/2m0s
time="2026-05-28T17:26:42-03:00" level=warning msg="The test has generated metrics with 100349 unique time series, which is higher than the suggested limit of 100000 and could cause high memory usage. Consider not using high-cardinality values like unique IDs as metric tags or, if you need them in the URL, use the name metric tag or URL grouping. See https://grafana.com/docs/k6/latest/using-k6/tags-and-groups/ for details." component=metrics-engine-ingester

running (2m12.0s), 120/120 VUs, 12880 complete and 0 interrupted iterations
listing   [  84% ] 80 VUs  1m41.0s/2m0s
sync      [  84% ] 40 VUs  1m41.0s/2m0s

running (2m13.0s), 120/120 VUs, 13000 complete and 0 interrupted iterations
listing   [  85% ] 80 VUs  1m42.0s/2m0s
sync      [  85% ] 40 VUs  1m42.0s/2m0s

running (2m14.0s), 120/120 VUs, 13120 complete and 0 interrupted iterations
listing   [  86% ] 80 VUs  1m43.0s/2m0s
sync      [  86% ] 40 VUs  1m43.0s/2m0s

running (2m15.0s), 120/120 VUs, 13240 complete and 0 interrupted iterations
listing   [  87% ] 80 VUs  1m44.0s/2m0s
sync      [  87% ] 40 VUs  1m44.0s/2m0s

running (2m16.0s), 120/120 VUs, 13360 complete and 0 interrupted iterations
listing   [  87% ] 80 VUs  1m45.0s/2m0s
sync      [  87% ] 40 VUs  1m45.0s/2m0s

running (2m17.0s), 120/120 VUs, 13480 complete and 0 interrupted iterations
listing   [  88% ] 80 VUs  1m46.0s/2m0s
sync      [  88% ] 40 VUs  1m46.0s/2m0s

running (2m18.0s), 120/120 VUs, 13600 complete and 0 interrupted iterations
listing   [  89% ] 80 VUs  1m47.0s/2m0s
sync      [  89% ] 40 VUs  1m47.0s/2m0s

running (2m19.0s), 120/120 VUs, 13757 complete and 0 interrupted iterations
listing   [  90% ] 80 VUs  1m48.0s/2m0s
sync      [  90% ] 40 VUs  1m48.0s/2m0s

running (2m20.0s), 120/120 VUs, 13918 complete and 0 interrupted iterations
listing   [  91% ] 80 VUs  1m49.0s/2m0s
sync      [  91% ] 40 VUs  1m49.0s/2m0s

running (2m21.0s), 120/120 VUs, 14040 complete and 0 interrupted iterations
listing   [  92% ] 80 VUs  1m50.0s/2m0s
sync      [  92% ] 40 VUs  1m50.0s/2m0s

running (2m22.0s), 120/120 VUs, 14160 complete and 0 interrupted iterations
listing   [  92% ] 80 VUs  1m51.0s/2m0s
sync      [  92% ] 40 VUs  1m51.0s/2m0s

running (2m23.0s), 120/120 VUs, 14280 complete and 0 interrupted iterations
listing   [  93% ] 80 VUs  1m52.0s/2m0s
sync      [  93% ] 40 VUs  1m52.0s/2m0s

running (2m24.0s), 120/120 VUs, 14400 complete and 0 interrupted iterations
listing   [  94% ] 80 VUs  1m53.0s/2m0s
sync      [  94% ] 40 VUs  1m53.0s/2m0s

running (2m25.0s), 120/120 VUs, 14520 complete and 0 interrupted iterations
listing   [  95% ] 80 VUs  1m54.0s/2m0s
sync      [  95% ] 40 VUs  1m54.0s/2m0s

running (2m26.0s), 120/120 VUs, 14640 complete and 0 interrupted iterations
listing   [  96% ] 80 VUs  1m55.0s/2m0s
sync      [  96% ] 40 VUs  1m55.0s/2m0s

running (2m27.0s), 120/120 VUs, 14760 complete and 0 interrupted iterations
listing   [  97% ] 80 VUs  1m56.0s/2m0s
sync      [  97% ] 40 VUs  1m56.0s/2m0s

running (2m28.0s), 120/120 VUs, 14920 complete and 0 interrupted iterations
listing   [  97% ] 80 VUs  1m57.0s/2m0s
sync      [  97% ] 40 VUs  1m57.0s/2m0s

running (2m29.0s), 120/120 VUs, 15067 complete and 0 interrupted iterations
listing   [  98% ] 80 VUs  1m58.0s/2m0s
sync      [  98% ] 40 VUs  1m58.0s/2m0s

running (2m30.0s), 120/120 VUs, 15200 complete and 0 interrupted iterations
listing   [  99% ] 80 VUs  1m59.0s/2m0s
sync      [  99% ] 40 VUs  1m59.0s/2m0s

running (2m31.0s), 120/120 VUs, 15320 complete and 0 interrupted iterations
listing   [ 100% ] 80 VUs  2m00.0s/2m0s
sync      [ 100% ] 40 VUs  2m00.0s/2m0s


  █ THRESHOLDS 

    http_req_duration
    ✓ 'p(95)<1000' p(95)=98.5ms

      {scenario:listing}
      ✓ 'p(95)<800' p(95)=102.1ms

      {scenario:sync}
      ✓ 'p(95)<500' p(95)=70.47ms

    http_req_failed
    ✓ 'rate<0.01' rate=0.00%


  █ TOTAL RESULTS 

    checks_total.......: 41600   274.059994/s
    checks_succeeded...: 100.00% 41600 out of 41600
    checks_failed......: 0.00%   0 out of 41600

    ✓ sync 200
    ✓ sync array
    ✓ recent 200
    ✓ recent array
    ✓ before 200

    HTTP
    http_req_duration..............: avg=40.74ms  min=3.19ms   med=24.57ms  max=180.1ms  p(90)=87.14ms p(95)=98.5ms 
      { expected_response:true }...: avg=40.74ms  min=3.19ms   med=24.57ms  max=180.1ms  p(90)=87.14ms p(95)=98.5ms 
      { scenario:listing }.........: avg=48.55ms  min=3.9ms    med=46.39ms  max=180.1ms  p(90)=92.53ms p(95)=102.1ms
      { scenario:sync }............: avg=22.67ms  min=3.19ms   med=13.44ms  max=137.45ms p(90)=54.9ms  p(95)=70.47ms
    http_req_failed................: 0.00%  0 out of 28932
    http_reqs......................: 28932  190.603455/s

    EXECUTION
    iteration_duration.............: avg=937.59ms min=846.15ms med=908.77ms max=1.13s    p(90)=1.02s   p(95)=1.04s  
    iterations.....................: 15440  101.718421/s
    vus............................: 120    min=0          max=120
    vus_max........................: 120    min=120        max=120

    NETWORK
    data_received..................: 366 MB 2.4 MB/s
    data_sent......................: 11 MB  72 kB/s




running (2m31.8s), 000/120 VUs, 15440 complete and 0 interrupted iterations
listing ✓ [ 100% ] 80 VUs  2m0s
sync    ✓ [ 100% ] 40 VUs  2m0s

================================================================
% cd DomainCommunity/messageRest && k6 run messageRest-spike.js
================================================================


         /\      Grafana   /‾‾/  
    /\  /  \     |\  __   /  /   
   /  \/    \    | |/ /  /   ‾‾\ 
  /          \   |   (  |  (‾)  |
 / __________ \  |_|\_\  \_____/ 


     execution: local
        script: messageRest-spike.js
        output: -

     scenarios: (100.00%) 1 scenario, 500 max VUs, 1m20s max duration (incl. graceful stop):
              * default: Up to 500 looping VUs for 50s over 5 stages (gracefulRampDown: 30s, gracefulStop: 30s)


Run       [ 100% ] setup()
default   [   0% ]

Run       [ 100% ] setup()
default   [   0% ]

Run       [ 100% ] setup()
default   [   0% ]

Run       [ 100% ] setup()
default   [   0% ]

Run       [ 100% ] setup()
default   [   0% ]

Run       [ 100% ] setup()
default   [   0% ]

Run       [ 100% ] setup()
default   [   0% ]

Run       [ 100% ] setup()
default   [   0% ]

Run       [ 100% ] setup()
default   [   0% ]

Run       [ 100% ] setup()
default   [   0% ]

Run       [ 100% ] setup()
default   [   0% ]

Run       [ 100% ] setup()
default   [   0% ]

Run       [ 100% ] setup()
default   [   0% ]

Run       [ 100% ] setup()
default   [   0% ]

Run       [ 100% ] setup()
default   [   0% ]

Run       [ 100% ] setup()
default   [   0% ]

Run       [ 100% ] setup()
default   [   0% ]

Run       [ 100% ] setup()
default   [   0% ]

Run       [ 100% ] setup()
default   [   0% ]

Run       [ 100% ] setup()
default   [   0% ]

Run       [ 100% ] setup()
default   [   0% ]

Run       [ 100% ] setup()
default   [   0% ]

Run       [ 100% ] setup()
default   [   0% ]

Run       [ 100% ] setup()
default   [   0% ]

Run       [ 100% ] setup()
default   [   0% ]

Run       [ 100% ] setup()
default   [   0% ]

Run       [ 100% ] setup()
default   [   0% ]

Run       [ 100% ] setup()
default   [   0% ]

Run       [ 100% ] setup()
default   [   0% ]

Run       [ 100% ] setup()
default   [   0% ]

Run       [ 100% ] setup()
default   [   0% ]

Run       [ 100% ] setup()
default   [   0% ]

Run       [ 100% ] setup()
default   [   0% ]

Run       [ 100% ] setup()
default   [   0% ]

Run       [ 100% ] setup()
default   [   0% ]

Run       [ 100% ] setup()
default   [   0% ]

Run       [ 100% ] setup()
default   [   0% ]

Run       [ 100% ] setup()
default   [   0% ]

Run       [ 100% ] setup()
default   [   0% ]

Run       [ 100% ] setup()
default   [   0% ]

Run       [ 100% ] setup()
default   [   0% ]

Run       [ 100% ] setup()
default   [   0% ]

Run       [ 100% ] setup()
default   [   0% ]

Run       [ 100% ] setup()
default   [   0% ]

Run       [ 100% ] setup()
default   [   0% ]

Run       [ 100% ] setup()
default   [   0% ]

Run       [ 100% ] setup()
default   [   0% ]

Run       [ 100% ] setup()
default   [   0% ]

Run       [ 100% ] setup()
default   [   0% ]

Run       [ 100% ] setup()
default   [   0% ]

Run       [ 100% ] setup()
default   [   0% ]

Run       [ 100% ] setup()
default   [   0% ]

Run       [ 100% ] setup()
default   [   0% ]

Run       [ 100% ] setup()
default   [   0% ]

Run       [ 100% ] setup()
default   [   0% ]

Run       [ 100% ] setup()
default   [   0% ]

Run       [ 100% ] setup()
default   [   0% ]

Run       [ 100% ] setup()
default   [   0% ]

Run       [ 100% ] setup()
default   [   0% ]

Run       [ 100% ] setup()
default   [   0% ]

Run       [ 100% ] setup()
default   [   0% ]

Run       [ 100% ] setup()
default   [   0% ]

Run       [ 100% ] setup()
default   [   0% ]

Run       [ 100% ] setup()
default   [   0% ]

Run       [ 100% ] setup()
default   [   0% ]

Run       [ 100% ] setup()
default   [   0% ]

running (1m07.0s), 003/500 VUs, 0 complete and 0 interrupted iterations
default   [   1% ] 003/500 VUs  00.4s/50.0s

running (1m08.0s), 010/500 VUs, 5 complete and 0 interrupted iterations
default   [   3% ] 010/500 VUs  01.4s/50.0s

running (1m09.0s), 017/500 VUs, 21 complete and 0 interrupted iterations
default   [   5% ] 017/500 VUs  02.4s/50.0s

running (1m10.0s), 024/500 VUs, 46 complete and 0 interrupted iterations
default   [   7% ] 024/500 VUs  03.4s/50.0s

running (1m11.0s), 031/500 VUs, 81 complete and 0 interrupted iterations
default   [   9% ] 031/500 VUs  04.4s/50.0s

running (1m12.0s), 038/500 VUs, 126 complete and 0 interrupted iterations
default   [  11% ] 038/500 VUs  05.4s/50.0s

running (1m13.0s), 045/500 VUs, 176 complete and 0 interrupted iterations
default   [  13% ] 045/500 VUs  06.4s/50.0s

running (1m14.0s), 052/500 VUs, 235 complete and 0 interrupted iterations
default   [  15% ] 052/500 VUs  07.4s/50.0s

running (1m15.0s), 058/500 VUs, 308 complete and 0 interrupted iterations
default   [  17% ] 058/500 VUs  08.4s/50.0s

running (1m16.0s), 065/500 VUs, 390 complete and 0 interrupted iterations
default   [  19% ] 065/500 VUs  09.4s/50.0s

running (1m17.0s), 103/500 VUs, 483 complete and 0 interrupted iterations
default   [  21% ] 103/500 VUs  10.4s/50.0s

running (1m18.0s), 189/500 VUs, 636 complete and 0 interrupted iterations
default   [  23% ] 189/500 VUs  11.4s/50.0s

running (1m19.0s), 275/500 VUs, 927 complete and 0 interrupted iterations
default   [  25% ] 275/500 VUs  12.4s/50.0s

running (1m20.0s), 361/500 VUs, 1325 complete and 0 interrupted iterations
default   [  27% ] 361/500 VUs  13.4s/50.0s

running (1m21.0s), 447/500 VUs, 1837 complete and 0 interrupted iterations
default   [  29% ] 447/500 VUs  14.4s/50.0s

running (1m22.0s), 500/500 VUs, 2465 complete and 0 interrupted iterations
default   [  31% ] 500/500 VUs  15.4s/50.0s

running (1m23.0s), 500/500 VUs, 3156 complete and 0 interrupted iterations
default   [  33% ] 500/500 VUs  16.4s/50.0s

running (1m24.0s), 500/500 VUs, 3849 complete and 0 interrupted iterations
default   [  35% ] 500/500 VUs  17.4s/50.0s

running (1m25.0s), 500/500 VUs, 4498 complete and 0 interrupted iterations
default   [  37% ] 500/500 VUs  18.4s/50.0s

running (1m26.0s), 500/500 VUs, 5212 complete and 0 interrupted iterations
default   [  39% ] 500/500 VUs  19.4s/50.0s

running (1m27.0s), 500/500 VUs, 5879 complete and 0 interrupted iterations
default   [  41% ] 500/500 VUs  20.4s/50.0s

running (1m28.0s), 500/500 VUs, 6566 complete and 0 interrupted iterations
default   [  43% ] 500/500 VUs  21.4s/50.0s

running (1m29.0s), 500/500 VUs, 7273 complete and 0 interrupted iterations
default   [  45% ] 500/500 VUs  22.4s/50.0s

running (1m30.0s), 500/500 VUs, 7931 complete and 0 interrupted iterations
default   [  47% ] 500/500 VUs  23.4s/50.0s

running (1m31.0s), 500/500 VUs, 8608 complete and 0 interrupted iterations
default   [  49% ] 500/500 VUs  24.4s/50.0s

running (1m32.0s), 500/500 VUs, 9331 complete and 0 interrupted iterations
default   [  51% ] 500/500 VUs  25.4s/50.0s

running (1m33.0s), 500/500 VUs, 9990 complete and 0 interrupted iterations
default   [  53% ] 500/500 VUs  26.4s/50.0s

running (1m34.0s), 500/500 VUs, 10680 complete and 0 interrupted iterations
default   [  55% ] 500/500 VUs  27.4s/50.0s

running (1m35.0s), 500/500 VUs, 11377 complete and 0 interrupted iterations
default   [  57% ] 500/500 VUs  28.4s/50.0s
time="2026-05-28T17:28:37-03:00" level=warning msg="The test has generated metrics with 100081 unique time series, which is higher than the suggested limit of 100000 and could cause high memory usage. Consider not using high-cardinality values like unique IDs as metric tags or, if you need them in the URL, use the name metric tag or URL grouping. See https://grafana.com/docs/k6/latest/using-k6/tags-and-groups/ for details." component=metrics-engine-ingester

running (1m36.0s), 500/500 VUs, 12026 complete and 0 interrupted iterations
default   [  59% ] 500/500 VUs  29.4s/50.0s

running (1m37.0s), 500/500 VUs, 12691 complete and 0 interrupted iterations
default   [  61% ] 500/500 VUs  30.4s/50.0s

running (1m38.0s), 500/500 VUs, 13425 complete and 0 interrupted iterations
default   [  63% ] 500/500 VUs  31.4s/50.0s

running (1m39.0s), 500/500 VUs, 14080 complete and 0 interrupted iterations
default   [  65% ] 500/500 VUs  32.4s/50.0s

running (1m40.0s), 500/500 VUs, 14767 complete and 0 interrupted iterations
default   [  67% ] 500/500 VUs  33.4s/50.0s

running (1m41.0s), 500/500 VUs, 15480 complete and 0 interrupted iterations
default   [  69% ] 500/500 VUs  34.4s/50.0s

running (1m42.0s), 489/500 VUs, 16143 complete and 0 interrupted iterations
default   [  71% ] 489/500 VUs  35.4s/50.0s

running (1m43.0s), 412/500 VUs, 16802 complete and 0 interrupted iterations
default   [  73% ] 412/500 VUs  36.4s/50.0s

running (1m44.0s), 325/500 VUs, 17365 complete and 0 interrupted iterations
default   [  75% ] 325/500 VUs  37.4s/50.0s

running (1m45.0s), 241/500 VUs, 17789 complete and 0 interrupted iterations
default   [  77% ] 241/500 VUs  38.4s/50.0s

running (1m46.0s), 151/500 VUs, 18115 complete and 0 interrupted iterations
default   [  79% ] 151/500 VUs  39.4s/50.0s

running (1m47.0s), 076/500 VUs, 18311 complete and 0 interrupted iterations
default   [  81% ] 076/500 VUs  40.4s/50.0s

running (1m48.0s), 063/500 VUs, 18410 complete and 0 interrupted iterations
default   [  83% ] 063/500 VUs  41.4s/50.0s

running (1m49.0s), 056/500 VUs, 18496 complete and 0 interrupted iterations
default   [  85% ] 056/500 VUs  42.4s/50.0s

running (1m50.0s), 049/500 VUs, 18573 complete and 0 interrupted iterations
default   [  87% ] 049/500 VUs  43.4s/50.0s

running (1m51.0s), 042/500 VUs, 18641 complete and 0 interrupted iterations
default   [  89% ] 042/500 VUs  44.4s/50.0s

running (1m52.0s), 036/500 VUs, 18693 complete and 0 interrupted iterations
default   [  91% ] 036/500 VUs  45.4s/50.0s

running (1m53.0s), 027/500 VUs, 18742 complete and 0 interrupted iterations
default   [  93% ] 027/500 VUs  46.4s/50.0s

running (1m54.0s), 021/500 VUs, 18778 complete and 0 interrupted iterations
default   [  95% ] 021/500 VUs  47.4s/50.0s

running (1m55.0s), 013/500 VUs, 18806 complete and 0 interrupted iterations
default   [  97% ] 013/500 VUs  48.4s/50.0s

running (1m56.0s), 008/500 VUs, 18821 complete and 0 interrupted iterations
default   [  99% ] 008/500 VUs  49.4s/50.0s

running (1m57.0s), 001/500 VUs, 18830 complete and 0 interrupted iterations
default ↓ [ 100% ] 003/500 VUs  50s


  █ THRESHOLDS 

    http_req_duration
    ✓ 'p(95)<2500' p(95)=27.59ms

    http_req_failed
    ✓ 'rate<0.05' rate=0.00%


  █ TOTAL RESULTS 

    checks_total.......: 37662   321.655606/s
    checks_succeeded...: 100.00% 37662 out of 37662
    checks_failed......: 0.00%   0 out of 37662

    ✓ list 200 ou 429
    ✓ sync 200 ou 429

    HTTP
    http_req_duration..............: avg=13.85ms  min=3.38ms   med=11.61ms  max=145.96ms p(90)=22.79ms  p(95)=27.59ms 
      { expected_response:true }...: avg=13.85ms  min=3.38ms   med=11.61ms  max=145.96ms p(90)=22.79ms  p(95)=27.59ms 
    http_req_failed................: 0.00%  0 out of 43674
    http_reqs......................: 43674  373.001618/s

    EXECUTION
    iteration_duration.............: avg=729.04ms min=708.11ms med=726.08ms max=867.7ms  p(90)=743.52ms p(95)=753.72ms
    iterations.....................: 18831  160.827803/s
    vus............................: 1      min=0          max=500
    vus_max........................: 500    min=500        max=500

    NETWORK
    data_received..................: 499 MB 4.3 MB/s
    data_sent......................: 17 MB  141 kB/s




running (1m57.1s), 000/500 VUs, 18831 complete and 0 interrupted iterations
default ✓ [ 100% ] 000/500 VUs  50s

================================================================
% cd DomainCommunity/messageRest && k6 run messageRest-stress.js
================================================================


         /\      Grafana   /‾‾/  
    /\  /  \     |\  __   /  /   
   /  \/    \    | |/ /  /   ‾‾\ 
  /          \   |   (  |  (‾)  |
 / __________ \  |_|\_\  \_____/ 


     execution: local
        script: messageRest-stress.js
        output: -

     scenarios: (100.00%) 1 scenario, 600 max VUs, 4m30s max duration (incl. graceful stop):
              * default: Up to 600 looping VUs for 4m0s over 8 stages (gracefulRampDown: 30s, gracefulStop: 30s)


Run       [ 100% ] setup()
default   [   0% ]

Run       [ 100% ] setup()
default   [   0% ]

Run       [ 100% ] setup()
default   [   0% ]

Run       [ 100% ] setup()
default   [   0% ]

Run       [ 100% ] setup()
default   [   0% ]

Run       [ 100% ] setup()
default   [   0% ]

Run       [ 100% ] setup()
default   [   0% ]

Run       [ 100% ] setup()
default   [   0% ]

Run       [ 100% ] setup()
default   [   0% ]

Run       [ 100% ] setup()
default   [   0% ]

Run       [ 100% ] setup()
default   [   0% ]

Run       [ 100% ] setup()
default   [   0% ]

Run       [ 100% ] setup()
default   [   0% ]

Run       [ 100% ] setup()
default   [   0% ]

Run       [ 100% ] setup()
default   [   0% ]

Run       [ 100% ] setup()
default   [   0% ]

Run       [ 100% ] setup()
default   [   0% ]

Run       [ 100% ] setup()
default   [   0% ]

Run       [ 100% ] setup()
default   [   0% ]

Run       [ 100% ] setup()
default   [   0% ]

Run       [ 100% ] setup()
default   [   0% ]

Run       [ 100% ] setup()
default   [   0% ]

Run       [ 100% ] setup()
default   [   0% ]

Run       [ 100% ] setup()
default   [   0% ]

Run       [ 100% ] setup()
default   [   0% ]

Run       [ 100% ] setup()
default   [   0% ]

Run       [ 100% ] setup()
default   [   0% ]

Run       [ 100% ] setup()
default   [   0% ]

Run       [ 100% ] setup()
default   [   0% ]

Run       [ 100% ] setup()
default   [   0% ]

Run       [ 100% ] setup()
default   [   0% ]

Run       [ 100% ] setup()
default   [   0% ]

Run       [ 100% ] setup()
default   [   0% ]

Run       [ 100% ] setup()
default   [   0% ]

Run       [ 100% ] setup()
default   [   0% ]

Run       [ 100% ] setup()
default   [   0% ]

Run       [ 100% ] setup()
default   [   0% ]

Run       [ 100% ] setup()
default   [   0% ]

Run       [ 100% ] setup()
default   [   0% ]

Run       [ 100% ] setup()
default   [   0% ]

Run       [ 100% ] setup()
default   [   0% ]

Run       [ 100% ] setup()
default   [   0% ]

Run       [ 100% ] setup()
default   [   0% ]

Run       [ 100% ] setup()
default   [   0% ]

Run       [ 100% ] setup()
default   [   0% ]

Run       [ 100% ] setup()
default   [   0% ]

Run       [ 100% ] setup()
default   [   0% ]

Run       [ 100% ] setup()
default   [   0% ]

Run       [ 100% ] setup()
default   [   0% ]

Run       [ 100% ] setup()
default   [   0% ]

Run       [ 100% ] setup()
default   [   0% ]

Run       [ 100% ] setup()
default   [   0% ]

Run       [ 100% ] setup()
default   [   0% ]

Run       [ 100% ] setup()
default   [   0% ]

Run       [ 100% ] setup()
default   [   0% ]

Run       [ 100% ] setup()
default   [   0% ]

Run       [ 100% ] setup()
default   [   0% ]

Run       [ 100% ] setup()
default   [   0% ]

Run       [ 100% ] setup()
default   [   0% ]

Run       [ 100% ] setup()
default   [   0% ]

Run       [ 100% ] setup()
default   [   0% ]

Run       [ 100% ] setup()
default   [   0% ]

Run       [ 100% ] setup()
default   [   0% ]

Run       [ 100% ] setup()
default   [   0% ]

Run       [ 100% ] setup()
default   [   0% ]

Run       [ 100% ] setup()
default   [   0% ]

Run       [ 100% ] setup()
default   [   0% ]

Run       [ 100% ] setup()
default   [   0% ]

Run       [ 100% ] setup()
default   [   0% ]

Run       [ 100% ] setup()
default   [   0% ]

Run       [ 100% ] setup()
default   [   0% ]

Run       [ 100% ] setup()
default   [   0% ]

Run       [ 100% ] setup()
default   [   0% ]

Run       [ 100% ] setup()
default   [   0% ]

Run       [ 100% ] setup()
default   [   0% ]

Run       [ 100% ] setup()
default   [   0% ]

Run       [ 100% ] setup()
default   [   0% ]

Run       [ 100% ] setup()
default   [   0% ]

Run       [ 100% ] setup()
default   [   0% ]

Run       [ 100% ] setup()
default   [   0% ]

Run       [ 100% ] setup()
default   [   0% ]

Run       [ 100% ] setup()
default   [   0% ]

Run       [ 100% ] setup()
default   [   0% ]

Run       [ 100% ] setup()
default   [   0% ]

Run       [ 100% ] setup()
default   [   0% ]

Run       [ 100% ] setup()
default   [   0% ]

Run       [ 100% ] setup()
default   [   0% ]

Run       [ 100% ] setup()
default   [   0% ]

Run       [ 100% ] setup()
default   [   0% ]

Run       [ 100% ] setup()
default   [   0% ]

Run       [ 100% ] setup()
default   [   0% ]

Run       [ 100% ] setup()
default   [   0% ]

Run       [ 100% ] setup()
default   [   0% ]

Run       [ 100% ] setup()
default   [   0% ]

Run       [ 100% ] setup()
default   [   0% ]

Run       [ 100% ] setup()
default   [   0% ]

Run       [ 100% ] setup()
default   [   0% ]

Run       [ 100% ] setup()
default   [   0% ]

Run       [ 100% ] setup()
default   [   0% ]

Run       [ 100% ] setup()
default   [   0% ]

Run       [ 100% ] setup()
default   [   0% ]

Run       [ 100% ] setup()
default   [   0% ]

Run       [ 100% ] setup()
default   [   0% ]

Run       [ 100% ] setup()
default   [   0% ]

Run       [ 100% ] setup()
default   [   0% ]

Run       [ 100% ] setup()
default   [   0% ]

running (1m47.0s), 001/600 VUs, 0 complete and 0 interrupted iterations
default   [   0% ] 001/600 VUs  0m00.7s/4m00.0s

running (1m48.0s), 002/600 VUs, 1 complete and 0 interrupted iterations
default   [   1% ] 002/600 VUs  0m01.7s/4m00.0s

running (1m49.0s), 002/600 VUs, 3 complete and 0 interrupted iterations
default   [   1% ] 002/600 VUs  0m02.7s/4m00.0s

running (1m50.0s), 003/600 VUs, 5 complete and 0 interrupted iterations
default   [   2% ] 003/600 VUs  0m03.7s/4m00.0s

running (1m51.0s), 004/600 VUs, 8 complete and 0 interrupted iterations
default   [   2% ] 004/600 VUs  0m04.7s/4m00.0s

running (1m52.0s), 004/600 VUs, 12 complete and 0 interrupted iterations
default   [   2% ] 004/600 VUs  0m05.7s/4m00.0s

running (1m53.0s), 005/600 VUs, 16 complete and 0 interrupted iterations
default   [   3% ] 005/600 VUs  0m06.7s/4m00.0s

running (1m54.0s), 005/600 VUs, 21 complete and 0 interrupted iterations
default   [   3% ] 005/600 VUs  0m07.7s/4m00.0s

running (1m55.0s), 006/600 VUs, 26 complete and 0 interrupted iterations
default   [   4% ] 006/600 VUs  0m08.7s/4m00.0s

running (1m56.0s), 007/600 VUs, 32 complete and 0 interrupted iterations
default   [   4% ] 007/600 VUs  0m09.7s/4m00.0s

running (1m57.0s), 007/600 VUs, 39 complete and 0 interrupted iterations
default   [   4% ] 007/600 VUs  0m10.7s/4m00.0s

running (1m58.0s), 008/600 VUs, 46 complete and 0 interrupted iterations
default   [   5% ] 008/600 VUs  0m11.7s/4m00.0s

running (1m59.0s), 009/600 VUs, 54 complete and 0 interrupted iterations
default   [   5% ] 009/600 VUs  0m12.7s/4m00.0s

running (2m00.0s), 009/600 VUs, 63 complete and 0 interrupted iterations
default   [   6% ] 009/600 VUs  0m13.7s/4m00.0s

running (2m01.0s), 010/600 VUs, 72 complete and 0 interrupted iterations
default   [   6% ] 010/600 VUs  0m14.7s/4m00.0s

running (2m02.0s), 010/600 VUs, 82 complete and 0 interrupted iterations
default   [   7% ] 010/600 VUs  0m15.7s/4m00.0s

running (2m03.0s), 011/600 VUs, 92 complete and 0 interrupted iterations
default   [   7% ] 011/600 VUs  0m16.7s/4m00.0s

running (2m04.0s), 012/600 VUs, 103 complete and 0 interrupted iterations
default   [   7% ] 012/600 VUs  0m17.7s/4m00.0s

running (2m05.0s), 012/600 VUs, 115 complete and 0 interrupted iterations
default   [   8% ] 012/600 VUs  0m18.7s/4m00.0s

running (2m06.0s), 013/600 VUs, 127 complete and 0 interrupted iterations
default   [   8% ] 013/600 VUs  0m19.7s/4m00.0s

running (2m07.0s), 014/600 VUs, 143 complete and 0 interrupted iterations
default   [   9% ] 014/600 VUs  0m20.7s/4m00.0s

running (2m08.0s), 014/600 VUs, 157 complete and 0 interrupted iterations
default   [   9% ] 014/600 VUs  0m21.7s/4m00.0s

running (2m09.0s), 015/600 VUs, 171 complete and 0 interrupted iterations
default   [   9% ] 015/600 VUs  0m22.7s/4m00.0s

running (2m10.0s), 016/600 VUs, 186 complete and 0 interrupted iterations
default   [  10% ] 016/600 VUs  0m23.7s/4m00.0s

running (2m11.0s), 016/600 VUs, 202 complete and 0 interrupted iterations
default   [  10% ] 016/600 VUs  0m24.7s/4m00.0s

running (2m12.0s), 017/600 VUs, 218 complete and 0 interrupted iterations
default   [  11% ] 017/600 VUs  0m25.7s/4m00.0s

running (2m13.0s), 017/600 VUs, 235 complete and 0 interrupted iterations
default   [  11% ] 017/600 VUs  0m26.7s/4m00.0s

running (2m14.0s), 018/600 VUs, 252 complete and 0 interrupted iterations
default   [  12% ] 018/600 VUs  0m27.7s/4m00.0s

running (2m15.0s), 019/600 VUs, 270 complete and 0 interrupted iterations
default   [  12% ] 019/600 VUs  0m28.7s/4m00.0s

running (2m16.0s), 019/600 VUs, 289 complete and 0 interrupted iterations
default   [  12% ] 019/600 VUs  0m29.7s/4m00.0s

running (2m17.0s), 020/600 VUs, 308 complete and 0 interrupted iterations
default   [  13% ] 020/600 VUs  0m30.7s/4m00.0s

running (2m18.0s), 021/600 VUs, 329 complete and 0 interrupted iterations
default   [  13% ] 021/600 VUs  0m31.7s/4m00.0s

running (2m19.0s), 022/600 VUs, 350 complete and 0 interrupted iterations
default   [  14% ] 022/600 VUs  0m32.7s/4m00.0s

running (2m20.0s), 023/600 VUs, 372 complete and 0 interrupted iterations
default   [  14% ] 023/600 VUs  0m33.7s/4m00.0s

running (2m21.0s), 024/600 VUs, 395 complete and 0 interrupted iterations
default   [  14% ] 024/600 VUs  0m34.7s/4m00.0s

running (2m22.0s), 025/600 VUs, 419 complete and 0 interrupted iterations
default   [  15% ] 025/600 VUs  0m35.7s/4m00.0s

running (2m23.0s), 026/600 VUs, 444 complete and 0 interrupted iterations
default   [  15% ] 026/600 VUs  0m36.7s/4m00.0s

running (2m24.0s), 027/600 VUs, 470 complete and 0 interrupted iterations
default   [  16% ] 027/600 VUs  0m37.7s/4m00.0s

running (2m25.0s), 028/600 VUs, 497 complete and 0 interrupted iterations
default   [  16% ] 028/600 VUs  0m38.7s/4m00.0s

running (2m26.0s), 029/600 VUs, 525 complete and 0 interrupted iterations
default   [  17% ] 029/600 VUs  0m39.7s/4m00.0s

running (2m27.0s), 030/600 VUs, 554 complete and 0 interrupted iterations
default   [  17% ] 030/600 VUs  0m40.7s/4m00.0s

running (2m28.0s), 031/600 VUs, 584 complete and 0 interrupted iterations
default   [  17% ] 031/600 VUs  0m41.7s/4m00.0s

running (2m29.0s), 032/600 VUs, 615 complete and 0 interrupted iterations
default   [  18% ] 032/600 VUs  0m42.7s/4m00.0s

running (2m30.0s), 033/600 VUs, 647 complete and 0 interrupted iterations
default   [  18% ] 033/600 VUs  0m43.7s/4m00.0s

running (2m31.0s), 034/600 VUs, 680 complete and 0 interrupted iterations
default   [  19% ] 034/600 VUs  0m44.7s/4m00.0s

running (2m32.0s), 035/600 VUs, 714 complete and 0 interrupted iterations
default   [  19% ] 035/600 VUs  0m45.7s/4m00.0s

running (2m33.0s), 036/600 VUs, 749 complete and 0 interrupted iterations
default   [  19% ] 036/600 VUs  0m46.7s/4m00.0s

running (2m34.0s), 037/600 VUs, 785 complete and 0 interrupted iterations
default   [  20% ] 037/600 VUs  0m47.7s/4m00.0s

running (2m35.0s), 038/600 VUs, 822 complete and 0 interrupted iterations
default   [  20% ] 038/600 VUs  0m48.7s/4m00.0s

running (2m36.0s), 039/600 VUs, 860 complete and 0 interrupted iterations
default   [  21% ] 039/600 VUs  0m49.7s/4m00.0s

running (2m37.0s), 040/600 VUs, 899 complete and 0 interrupted iterations
default   [  21% ] 040/600 VUs  0m50.7s/4m00.0s

running (2m38.0s), 041/600 VUs, 939 complete and 0 interrupted iterations
default   [  22% ] 041/600 VUs  0m51.7s/4m00.0s

running (2m39.0s), 042/600 VUs, 980 complete and 0 interrupted iterations
default   [  22% ] 042/600 VUs  0m52.7s/4m00.0s

running (2m40.0s), 043/600 VUs, 1032 complete and 0 interrupted iterations
default   [  22% ] 043/600 VUs  0m53.7s/4m00.0s

running (2m41.0s), 044/600 VUs, 1083 complete and 0 interrupted iterations
default   [  23% ] 044/600 VUs  0m54.7s/4m00.0s

running (2m42.0s), 045/600 VUs, 1109 complete and 0 interrupted iterations
default   [  23% ] 045/600 VUs  0m55.7s/4m00.0s

running (2m43.0s), 046/600 VUs, 1154 complete and 0 interrupted iterations
default   [  24% ] 046/600 VUs  0m56.7s/4m00.0s

running (2m44.0s), 047/600 VUs, 1200 complete and 0 interrupted iterations
default   [  24% ] 047/600 VUs  0m57.7s/4m00.0s

running (2m45.0s), 048/600 VUs, 1247 complete and 0 interrupted iterations
default   [  24% ] 048/600 VUs  0m58.7s/4m00.0s

running (2m46.0s), 049/600 VUs, 1295 complete and 0 interrupted iterations
default   [  25% ] 049/600 VUs  0m59.7s/4m00.0s

running (2m47.0s), 051/600 VUs, 1344 complete and 0 interrupted iterations
default   [  25% ] 051/600 VUs  1m00.7s/4m00.0s

running (2m48.0s), 052/600 VUs, 1395 complete and 0 interrupted iterations
default   [  26% ] 052/600 VUs  1m01.7s/4m00.0s

running (2m49.0s), 054/600 VUs, 1447 complete and 0 interrupted iterations
default   [  26% ] 054/600 VUs  1m02.7s/4m00.0s

running (2m50.0s), 056/600 VUs, 1501 complete and 0 interrupted iterations
default   [  27% ] 056/600 VUs  1m03.7s/4m00.0s

running (2m51.0s), 057/600 VUs, 1557 complete and 0 interrupted iterations
default   [  27% ] 057/600 VUs  1m04.7s/4m00.0s

running (2m52.0s), 059/600 VUs, 1625 complete and 0 interrupted iterations
default   [  27% ] 059/600 VUs  1m05.7s/4m00.0s

running (2m53.0s), 061/600 VUs, 1696 complete and 0 interrupted iterations
default   [  28% ] 061/600 VUs  1m06.7s/4m00.0s

running (2m54.0s), 062/600 VUs, 1761 complete and 0 interrupted iterations
default   [  28% ] 062/600 VUs  1m07.7s/4m00.0s

running (2m55.0s), 064/600 VUs, 1839 complete and 0 interrupted iterations
default   [  29% ] 064/600 VUs  1m08.7s/4m00.0s

running (2m56.0s), 066/600 VUs, 1906 complete and 0 interrupted iterations
default   [  29% ] 066/600 VUs  1m09.7s/4m00.0s

running (2m57.0s), 067/600 VUs, 1972 complete and 0 interrupted iterations
default   [  29% ] 067/600 VUs  1m10.7s/4m00.0s

running (2m58.0s), 069/600 VUs, 2039 complete and 0 interrupted iterations
default   [  30% ] 069/600 VUs  1m11.7s/4m00.0s

running (2m59.0s), 071/600 VUs, 2110 complete and 0 interrupted iterations
default   [  30% ] 071/600 VUs  1m12.7s/4m00.0s

running (3m00.0s), 072/600 VUs, 2181 complete and 0 interrupted iterations
default   [  31% ] 072/600 VUs  1m13.7s/4m00.0s

running (3m01.0s), 074/600 VUs, 2259 complete and 0 interrupted iterations
default   [  31% ] 074/600 VUs  1m14.7s/4m00.0s

running (3m02.0s), 076/600 VUs, 2334 complete and 0 interrupted iterations
default   [  32% ] 076/600 VUs  1m15.7s/4m00.0s

running (3m03.0s), 077/600 VUs, 2413 complete and 0 interrupted iterations
default   [  32% ] 077/600 VUs  1m16.7s/4m00.0s

running (3m04.0s), 079/600 VUs, 2491 complete and 0 interrupted iterations
default   [  32% ] 079/600 VUs  1m17.7s/4m00.0s

running (3m05.0s), 081/600 VUs, 2572 complete and 0 interrupted iterations
default   [  33% ] 081/600 VUs  1m18.7s/4m00.0s

running (3m06.0s), 082/600 VUs, 2654 complete and 0 interrupted iterations
default   [  33% ] 082/600 VUs  1m19.7s/4m00.0s

running (3m07.0s), 084/600 VUs, 2737 complete and 0 interrupted iterations
default   [  34% ] 084/600 VUs  1m20.7s/4m00.0s

running (3m08.0s), 086/600 VUs, 2821 complete and 0 interrupted iterations
default   [  34% ] 086/600 VUs  1m21.7s/4m00.0s

running (3m09.0s), 087/600 VUs, 2910 complete and 0 interrupted iterations
default   [  34% ] 087/600 VUs  1m22.7s/4m00.0s

running (3m10.0s), 089/600 VUs, 2997 complete and 0 interrupted iterations
default   [  35% ] 089/600 VUs  1m23.7s/4m00.0s

running (3m11.0s), 091/600 VUs, 3087 complete and 0 interrupted iterations
default   [  35% ] 091/600 VUs  1m24.7s/4m00.0s

running (3m12.0s), 092/600 VUs, 3178 complete and 0 interrupted iterations
default   [  36% ] 092/600 VUs  1m25.7s/4m00.0s

running (3m13.0s), 094/600 VUs, 3271 complete and 0 interrupted iterations
default   [  36% ] 094/600 VUs  1m26.7s/4m00.0s

running (3m14.0s), 096/600 VUs, 3366 complete and 0 interrupted iterations
default   [  37% ] 096/600 VUs  1m27.7s/4m00.0s

running (3m15.0s), 097/600 VUs, 3462 complete and 0 interrupted iterations
default   [  37% ] 097/600 VUs  1m28.7s/4m00.0s

running (3m16.0s), 099/600 VUs, 3561 complete and 0 interrupted iterations
default   [  37% ] 099/600 VUs  1m29.7s/4m00.0s

running (3m17.0s), 102/600 VUs, 3660 complete and 0 interrupted iterations
default   [  38% ] 102/600 VUs  1m30.7s/4m00.0s

running (3m18.0s), 105/600 VUs, 3762 complete and 0 interrupted iterations
default   [  38% ] 105/600 VUs  1m31.7s/4m00.0s

running (3m19.0s), 109/600 VUs, 3877 complete and 0 interrupted iterations
default   [  39% ] 109/600 VUs  1m32.7s/4m00.0s

running (3m20.0s), 112/600 VUs, 3987 complete and 0 interrupted iterations
default   [  39% ] 112/600 VUs  1m33.7s/4m00.0s

running (3m21.0s), 115/600 VUs, 4101 complete and 0 interrupted iterations
default   [  39% ] 115/600 VUs  1m34.7s/4m00.0s

running (3m22.0s), 119/600 VUs, 4222 complete and 0 interrupted iterations
default   [  40% ] 119/600 VUs  1m35.7s/4m00.0s

running (3m23.0s), 122/600 VUs, 4345 complete and 0 interrupted iterations
default   [  40% ] 122/600 VUs  1m36.7s/4m00.0s

running (3m24.0s), 125/600 VUs, 4482 complete and 0 interrupted iterations
default   [  41% ] 125/600 VUs  1m37.7s/4m00.0s

running (3m25.0s), 129/600 VUs, 4611 complete and 0 interrupted iterations
default   [  41% ] 129/600 VUs  1m38.7s/4m00.0s

running (3m26.0s), 132/600 VUs, 4759 complete and 0 interrupted iterations
default   [  42% ] 132/600 VUs  1m39.7s/4m00.0s

running (3m27.0s), 135/600 VUs, 4900 complete and 0 interrupted iterations
default   [  42% ] 135/600 VUs  1m40.7s/4m00.0s

running (3m28.0s), 139/600 VUs, 5045 complete and 0 interrupted iterations
default   [  42% ] 139/600 VUs  1m41.7s/4m00.0s

running (3m29.0s), 142/600 VUs, 5193 complete and 0 interrupted iterations
default   [  43% ] 142/600 VUs  1m42.7s/4m00.0s

running (3m30.0s), 145/600 VUs, 5347 complete and 0 interrupted iterations
default   [  43% ] 145/600 VUs  1m43.7s/4m00.0s

running (3m31.0s), 149/600 VUs, 5504 complete and 0 interrupted iterations
default   [  44% ] 149/600 VUs  1m44.7s/4m00.0s

running (3m32.0s), 152/600 VUs, 5657 complete and 0 interrupted iterations
default   [  44% ] 152/600 VUs  1m45.7s/4m00.0s

running (3m33.0s), 155/600 VUs, 5817 complete and 0 interrupted iterations
default   [  44% ] 155/600 VUs  1m46.7s/4m00.0s
time="2026-05-28T17:32:33-03:00" level=warning msg="The test has generated metrics with 100001 unique time series, which is higher than the suggested limit of 100000 and could cause high memory usage. Consider not using high-cardinality values like unique IDs as metric tags or, if you need them in the URL, use the name metric tag or URL grouping. See https://grafana.com/docs/k6/latest/using-k6/tags-and-groups/ for details." component=metrics-engine-ingester

running (3m34.0s), 159/600 VUs, 5974 complete and 0 interrupted iterations
default   [  45% ] 159/600 VUs  1m47.7s/4m00.0s

running (3m35.0s), 162/600 VUs, 6135 complete and 0 interrupted iterations
default   [  45% ] 162/600 VUs  1m48.7s/4m00.0s

running (3m36.0s), 165/600 VUs, 6304 complete and 0 interrupted iterations
default   [  46% ] 165/600 VUs  1m49.7s/4m00.0s

running (3m37.0s), 169/600 VUs, 6470 complete and 0 interrupted iterations
default   [  46% ] 169/600 VUs  1m50.7s/4m00.0s

running (3m38.0s), 172/600 VUs, 6642 complete and 0 interrupted iterations
default   [  47% ] 172/600 VUs  1m51.7s/4m00.0s

running (3m39.0s), 175/600 VUs, 6816 complete and 0 interrupted iterations
default   [  47% ] 175/600 VUs  1m52.7s/4m00.0s

running (3m40.0s), 179/600 VUs, 6993 complete and 0 interrupted iterations
default   [  47% ] 179/600 VUs  1m53.7s/4m00.0s

running (3m41.0s), 182/600 VUs, 7177 complete and 0 interrupted iterations
default   [  48% ] 182/600 VUs  1m54.7s/4m00.0s

running (3m42.0s), 185/600 VUs, 7364 complete and 0 interrupted iterations
default   [  48% ] 185/600 VUs  1m55.7s/4m00.0s

running (3m43.0s), 189/600 VUs, 7552 complete and 0 interrupted iterations
default   [  49% ] 189/600 VUs  1m56.7s/4m00.0s

running (3m44.0s), 192/600 VUs, 7744 complete and 0 interrupted iterations
default   [  49% ] 192/600 VUs  1m57.7s/4m00.0s

running (3m45.0s), 195/600 VUs, 7940 complete and 0 interrupted iterations
default   [  49% ] 195/600 VUs  1m58.7s/4m00.0s

running (3m46.0s), 199/600 VUs, 8137 complete and 0 interrupted iterations
default   [  50% ] 199/600 VUs  1m59.7s/4m00.0s

running (3m47.0s), 202/600 VUs, 8341 complete and 0 interrupted iterations
default   [  50% ] 202/600 VUs  2m00.7s/4m00.0s

running (3m48.0s), 205/600 VUs, 8543 complete and 0 interrupted iterations
default   [  51% ] 205/600 VUs  2m01.7s/4m00.0s

running (3m49.0s), 209/600 VUs, 8748 complete and 0 interrupted iterations
default   [  51% ] 209/600 VUs  2m02.7s/4m00.0s

running (3m50.0s), 212/600 VUs, 8945 complete and 0 interrupted iterations
default   [  52% ] 212/600 VUs  2m03.7s/4m00.0s

running (3m51.0s), 215/600 VUs, 9154 complete and 0 interrupted iterations
default   [  52% ] 215/600 VUs  2m04.7s/4m00.0s

running (3m52.0s), 219/600 VUs, 9361 complete and 0 interrupted iterations
default   [  52% ] 219/600 VUs  2m05.7s/4m00.0s

running (3m53.0s), 222/600 VUs, 9573 complete and 0 interrupted iterations
default   [  53% ] 222/600 VUs  2m06.7s/4m00.0s

running (3m54.0s), 225/600 VUs, 9787 complete and 0 interrupted iterations
default   [  53% ] 225/600 VUs  2m07.7s/4m00.0s

running (3m55.0s), 229/600 VUs, 10002 complete and 0 interrupted iterations
default   [  54% ] 229/600 VUs  2m08.7s/4m00.0s

running (3m56.0s), 232/600 VUs, 10229 complete and 0 interrupted iterations
default   [  54% ] 232/600 VUs  2m09.7s/4m00.0s

running (3m57.0s), 235/600 VUs, 10457 complete and 0 interrupted iterations
default   [  54% ] 235/600 VUs  2m10.7s/4m00.0s

running (3m58.0s), 239/600 VUs, 10690 complete and 0 interrupted iterations
default   [  55% ] 239/600 VUs  2m11.7s/4m00.0s

running (3m59.0s), 242/600 VUs, 10925 complete and 0 interrupted iterations
default   [  55% ] 242/600 VUs  2m12.7s/4m00.0s

running (4m00.0s), 245/600 VUs, 11162 complete and 0 interrupted iterations
default   [  56% ] 245/600 VUs  2m13.7s/4m00.0s

running (4m01.0s), 249/600 VUs, 11410 complete and 0 interrupted iterations
default   [  56% ] 249/600 VUs  2m14.7s/4m00.0s
time="2026-05-28T17:33:01-03:00" level=warning msg="The test has generated metrics with 200243 unique time series, which is higher than the suggested limit of 100000 and could cause high memory usage. Consider not using high-cardinality values like unique IDs as metric tags or, if you need them in the URL, use the name metric tag or URL grouping. See https://grafana.com/docs/k6/latest/using-k6/tags-and-groups/ for details." component=metrics-engine-ingester

running (4m02.0s), 252/600 VUs, 11660 complete and 0 interrupted iterations
default   [  57% ] 252/600 VUs  2m15.7s/4m00.0s

running (4m03.0s), 255/600 VUs, 11912 complete and 0 interrupted iterations
default   [  57% ] 255/600 VUs  2m16.7s/4m00.0s

running (4m04.0s), 259/600 VUs, 12167 complete and 0 interrupted iterations
default   [  57% ] 259/600 VUs  2m17.7s/4m00.0s

running (4m05.0s), 262/600 VUs, 12417 complete and 0 interrupted iterations
default   [  58% ] 262/600 VUs  2m18.7s/4m00.0s

running (4m06.0s), 265/600 VUs, 12660 complete and 0 interrupted iterations
default   [  58% ] 265/600 VUs  2m19.7s/4m00.0s

running (4m07.0s), 269/600 VUs, 12902 complete and 0 interrupted iterations
default   [  59% ] 269/600 VUs  2m20.7s/4m00.0s

running (4m08.0s), 272/600 VUs, 13101 complete and 0 interrupted iterations
default   [  59% ] 272/600 VUs  2m21.7s/4m00.0s

running (4m09.0s), 275/600 VUs, 13354 complete and 0 interrupted iterations
default   [  59% ] 275/600 VUs  2m22.7s/4m00.0s

running (4m10.0s), 279/600 VUs, 13626 complete and 0 interrupted iterations
default   [  60% ] 279/600 VUs  2m23.7s/4m00.0s

running (4m11.0s), 282/600 VUs, 13902 complete and 0 interrupted iterations
default   [  60% ] 282/600 VUs  2m24.7s/4m00.0s

running (4m12.0s), 285/600 VUs, 14130 complete and 0 interrupted iterations
default   [  61% ] 285/600 VUs  2m25.7s/4m00.0s

running (4m13.0s), 289/600 VUs, 14337 complete and 0 interrupted iterations
default   [  61% ] 289/600 VUs  2m26.7s/4m00.0s

running (4m14.0s), 292/600 VUs, 14620 complete and 0 interrupted iterations
default   [  62% ] 292/600 VUs  2m27.7s/4m00.0s

running (4m15.0s), 295/600 VUs, 14906 complete and 0 interrupted iterations
default   [  62% ] 295/600 VUs  2m28.7s/4m00.0s

running (4m16.0s), 299/600 VUs, 15089 complete and 0 interrupted iterations
default   [  62% ] 299/600 VUs  2m29.7s/4m00.0s

running (4m17.0s), 302/600 VUs, 15355 complete and 0 interrupted iterations
default   [  63% ] 302/600 VUs  2m30.7s/4m00.0s

running (4m18.0s), 305/600 VUs, 15656 complete and 0 interrupted iterations
default   [  63% ] 305/600 VUs  2m31.7s/4m00.0s

running (4m19.0s), 309/600 VUs, 15813 complete and 0 interrupted iterations
default   [  64% ] 309/600 VUs  2m32.7s/4m00.0s

running (4m20.0s), 312/600 VUs, 16119 complete and 0 interrupted iterations
default   [  64% ] 312/600 VUs  2m33.7s/4m00.0s

running (4m21.0s), 315/600 VUs, 16316 complete and 0 interrupted iterations
default   [  64% ] 315/600 VUs  2m34.7s/4m00.0s

running (4m22.0s), 319/600 VUs, 16587 complete and 0 interrupted iterations
default   [  65% ] 319/600 VUs  2m35.7s/4m00.0s

running (4m23.0s), 322/600 VUs, 16901 complete and 0 interrupted iterations
default   [  65% ] 322/600 VUs  2m36.7s/4m00.0s

running (4m24.0s), 325/600 VUs, 17069 complete and 0 interrupted iterations
default   [  66% ] 325/600 VUs  2m37.7s/4m00.0s

running (4m25.0s), 329/600 VUs, 17393 complete and 0 interrupted iterations
default   [  66% ] 329/600 VUs  2m38.7s/4m00.0s

running (4m26.0s), 332/600 VUs, 17556 complete and 0 interrupted iterations
default   [  67% ] 332/600 VUs  2m39.7s/4m00.0s

running (4m27.0s), 335/600 VUs, 17886 complete and 0 interrupted iterations
default   [  67% ] 335/600 VUs  2m40.7s/4m00.0s

running (4m28.0s), 339/600 VUs, 18076 complete and 0 interrupted iterations
default   [  67% ] 339/600 VUs  2m41.7s/4m00.0s

running (4m29.0s), 342/600 VUs, 18394 complete and 0 interrupted iterations
default   [  68% ] 342/600 VUs  2m42.7s/4m00.0s

running (4m30.0s), 345/600 VUs, 18582 complete and 0 interrupted iterations
default   [  68% ] 345/600 VUs  2m43.7s/4m00.0s

running (4m31.0s), 349/600 VUs, 18906 complete and 0 interrupted iterations
default   [  69% ] 349/600 VUs  2m44.7s/4m00.0s

running (4m32.0s), 352/600 VUs, 19138 complete and 0 interrupted iterations
default   [  69% ] 352/600 VUs  2m45.7s/4m00.0s

running (4m33.0s), 355/600 VUs, 19431 complete and 0 interrupted iterations
default   [  69% ] 355/600 VUs  2m46.7s/4m00.0s

running (4m34.0s), 359/600 VUs, 19663 complete and 0 interrupted iterations
default   [  70% ] 359/600 VUs  2m47.7s/4m00.0s

running (4m35.0s), 362/600 VUs, 19967 complete and 0 interrupted iterations
default   [  70% ] 362/600 VUs  2m48.7s/4m00.0s

running (4m36.0s), 365/600 VUs, 20156 complete and 0 interrupted iterations
default   [  71% ] 365/600 VUs  2m49.7s/4m00.0s

running (4m37.0s), 369/600 VUs, 20509 complete and 0 interrupted iterations
default   [  71% ] 369/600 VUs  2m50.7s/4m00.0s

running (4m38.0s), 372/600 VUs, 20697 complete and 0 interrupted iterations
default   [  72% ] 372/600 VUs  2m51.7s/4m00.0s

running (4m39.0s), 375/600 VUs, 20972 complete and 0 interrupted iterations
default   [  72% ] 375/600 VUs  2m52.7s/4m00.0s

running (4m40.0s), 379/600 VUs, 21255 complete and 0 interrupted iterations
default   [  72% ] 379/600 VUs  2m53.7s/4m00.0s

running (4m41.0s), 382/600 VUs, 21446 complete and 0 interrupted iterations
default   [  73% ] 382/600 VUs  2m54.7s/4m00.0s

running (4m42.0s), 385/600 VUs, 21804 complete and 0 interrupted iterations
default   [  73% ] 385/600 VUs  2m55.7s/4m00.0s

running (4m43.0s), 389/600 VUs, 22018 complete and 0 interrupted iterations
default   [  74% ] 389/600 VUs  2m56.7s/4m00.0s

running (4m44.0s), 392/600 VUs, 22252 complete and 0 interrupted iterations
default   [  74% ] 392/600 VUs  2m57.7s/4m00.0s

running (4m45.0s), 395/600 VUs, 22599 complete and 0 interrupted iterations
default   [  74% ] 395/600 VUs  2m58.7s/4m00.0s

running (4m46.0s), 399/600 VUs, 22801 complete and 0 interrupted iterations
default   [  75% ] 399/600 VUs  2m59.7s/4m00.0s

running (4m47.0s), 404/600 VUs, 23076 complete and 0 interrupted iterations
default   [  75% ] 404/600 VUs  3m00.7s/4m00.0s
time="2026-05-28T17:33:47-03:00" level=warning msg="The test has generated metrics with 400331 unique time series, which is higher than the suggested limit of 100000 and could cause high memory usage. Consider not using high-cardinality values like unique IDs as metric tags or, if you need them in the URL, use the name metric tag or URL grouping. See https://grafana.com/docs/k6/latest/using-k6/tags-and-groups/ for details." component=metrics-engine-ingester

running (4m48.0s), 411/600 VUs, 23396 complete and 0 interrupted iterations
default   [  76% ] 411/600 VUs  3m01.7s/4m00.0s

running (4m49.0s), 418/600 VUs, 23606 complete and 0 interrupted iterations
default   [  76% ] 418/600 VUs  3m02.7s/4m00.0s

running (4m50.0s), 424/600 VUs, 23810 complete and 0 interrupted iterations
default   [  77% ] 424/600 VUs  3m03.7s/4m00.0s

running (4m51.0s), 431/600 VUs, 24154 complete and 0 interrupted iterations
default   [  77% ] 431/600 VUs  3m04.7s/4m00.0s

running (4m52.0s), 438/600 VUs, 24452 complete and 0 interrupted iterations
default   [  77% ] 438/600 VUs  3m05.7s/4m00.0s

running (4m53.0s), 444/600 VUs, 24665 complete and 0 interrupted iterations
default   [  78% ] 444/600 VUs  3m06.7s/4m00.0s

running (4m54.0s), 451/600 VUs, 24891 complete and 0 interrupted iterations
default   [  78% ] 451/600 VUs  3m07.7s/4m00.0s

running (4m55.0s), 458/600 VUs, 25110 complete and 0 interrupted iterations
default   [  79% ] 458/600 VUs  3m08.7s/4m00.0s

running (4m56.0s), 464/600 VUs, 25424 complete and 0 interrupted iterations
default   [  79% ] 464/600 VUs  3m09.7s/4m00.0s

running (4m57.0s), 471/600 VUs, 25798 complete and 0 interrupted iterations
default   [  79% ] 471/600 VUs  3m10.7s/4m00.0s

running (4m58.0s), 478/600 VUs, 26033 complete and 0 interrupted iterations
default   [  80% ] 478/600 VUs  3m11.7s/4m00.0s

running (4m59.0s), 484/600 VUs, 26276 complete and 0 interrupted iterations
default   [  80% ] 484/600 VUs  3m12.7s/4m00.0s

running (5m00.0s), 491/600 VUs, 26514 complete and 0 interrupted iterations
default   [  81% ] 491/600 VUs  3m13.7s/4m00.0s

running (5m01.0s), 498/600 VUs, 26763 complete and 0 interrupted iterations
default   [  81% ] 498/600 VUs  3m14.7s/4m00.0s

running (5m02.0s), 504/600 VUs, 27006 complete and 0 interrupted iterations
default   [  82% ] 504/600 VUs  3m15.7s/4m00.0s

running (5m03.0s), 511/600 VUs, 27267 complete and 0 interrupted iterations
default   [  82% ] 511/600 VUs  3m16.7s/4m00.0s

running (5m04.0s), 518/600 VUs, 27515 complete and 0 interrupted iterations
default   [  82% ] 518/600 VUs  3m17.7s/4m00.0s

running (5m05.0s), 524/600 VUs, 27790 complete and 0 interrupted iterations
default   [  83% ] 524/600 VUs  3m18.7s/4m00.0s

running (5m06.0s), 531/600 VUs, 28048 complete and 0 interrupted iterations
default   [  83% ] 531/600 VUs  3m19.7s/4m00.0s

running (5m07.0s), 538/600 VUs, 28321 complete and 0 interrupted iterations
default   [  84% ] 538/600 VUs  3m20.7s/4m00.0s

running (5m08.0s), 544/600 VUs, 28571 complete and 0 interrupted iterations
default   [  84% ] 544/600 VUs  3m21.7s/4m00.0s

running (5m09.0s), 551/600 VUs, 28841 complete and 0 interrupted iterations
default   [  84% ] 551/600 VUs  3m22.7s/4m00.0s

running (5m10.0s), 558/600 VUs, 29100 complete and 0 interrupted iterations
default   [  85% ] 558/600 VUs  3m23.7s/4m00.0s

running (5m11.0s), 564/600 VUs, 29385 complete and 0 interrupted iterations
default   [  85% ] 564/600 VUs  3m24.7s/4m00.0s

running (5m12.0s), 571/600 VUs, 29655 complete and 0 interrupted iterations
default   [  86% ] 571/600 VUs  3m25.7s/4m00.0s

running (5m13.0s), 578/600 VUs, 29948 complete and 0 interrupted iterations
default   [  86% ] 578/600 VUs  3m26.7s/4m00.0s

running (5m14.0s), 584/600 VUs, 30200 complete and 0 interrupted iterations
default   [  87% ] 584/600 VUs  3m27.7s/4m00.0s

running (5m15.0s), 591/600 VUs, 30366 complete and 0 interrupted iterations
default   [  87% ] 591/600 VUs  3m28.7s/4m00.0s

running (5m16.0s), 598/600 VUs, 30649 complete and 0 interrupted iterations
default   [  87% ] 598/600 VUs  3m29.7s/4m00.0s

running (5m17.0s), 600/600 VUs, 30855 complete and 0 interrupted iterations
default   [  88% ] 600/600 VUs  3m30.7s/4m00.0s

running (5m18.0s), 587/600 VUs, 31147 complete and 0 interrupted iterations
default   [  88% ] 587/600 VUs  3m31.7s/4m00.0s

running (5m19.0s), 571/600 VUs, 31419 complete and 0 interrupted iterations
default   [  89% ] 571/600 VUs  3m32.7s/4m00.0s

running (5m20.0s), 552/600 VUs, 31713 complete and 0 interrupted iterations
default   [  89% ] 552/600 VUs  3m33.7s/4m00.0s

running (5m21.0s), 527/600 VUs, 31991 complete and 0 interrupted iterations
default   [  89% ] 527/600 VUs  3m34.7s/4m00.0s

running (5m22.0s), 507/600 VUs, 32263 complete and 0 interrupted iterations
default   [  90% ] 507/600 VUs  3m35.7s/4m00.0s

running (5m23.0s), 490/600 VUs, 32519 complete and 0 interrupted iterations
default   [  90% ] 490/600 VUs  3m36.7s/4m00.0s

running (5m24.0s), 471/600 VUs, 32775 complete and 0 interrupted iterations
default   [  91% ] 471/600 VUs  3m37.7s/4m00.0s

running (5m25.0s), 450/600 VUs, 33048 complete and 0 interrupted iterations
default   [  91% ] 450/600 VUs  3m38.7s/4m00.0s

running (5m26.0s), 415/600 VUs, 33430 complete and 0 interrupted iterations
default   [  92% ] 415/600 VUs  3m39.7s/4m00.0s

running (5m27.0s), 398/600 VUs, 33667 complete and 0 interrupted iterations
default   [  92% ] 398/600 VUs  3m40.7s/4m00.0s

running (5m28.0s), 383/600 VUs, 33877 complete and 0 interrupted iterations
default   [  92% ] 383/600 VUs  3m41.7s/4m00.0s

running (5m29.0s), 354/600 VUs, 34251 complete and 0 interrupted iterations
default   [  93% ] 354/600 VUs  3m42.7s/4m00.0s

running (5m30.0s), 343/600 VUs, 34438 complete and 0 interrupted iterations
default   [  93% ] 343/600 VUs  3m43.7s/4m00.0s

running (5m31.0s), 314/600 VUs, 34774 complete and 0 interrupted iterations
default   [  94% ] 314/600 VUs  3m44.7s/4m00.0s

running (5m32.0s), 301/600 VUs, 34945 complete and 0 interrupted iterations
default   [  94% ] 301/600 VUs  3m45.7s/4m00.0s

running (5m33.0s), 280/600 VUs, 35237 complete and 0 interrupted iterations
default   [  94% ] 280/600 VUs  3m46.7s/4m00.0s

running (5m34.0s), 256/600 VUs, 35517 complete and 0 interrupted iterations
default   [  95% ] 256/600 VUs  3m47.7s/4m00.0s

running (5m35.0s), 235/600 VUs, 35772 complete and 0 interrupted iterations
default   [  95% ] 235/600 VUs  3m48.7s/4m00.0s

running (5m36.0s), 212/600 VUs, 36004 complete and 0 interrupted iterations
default   [  96% ] 212/600 VUs  3m49.7s/4m00.0s

running (5m37.0s), 193/600 VUs, 36216 complete and 0 interrupted iterations
default   [  96% ] 193/600 VUs  3m50.7s/4m00.0s

running (5m38.0s), 173/600 VUs, 36410 complete and 0 interrupted iterations
default   [  97% ] 173/600 VUs  3m51.7s/4m00.0s

running (5m39.0s), 157/600 VUs, 36583 complete and 0 interrupted iterations
default   [  97% ] 157/600 VUs  3m52.7s/4m00.0s

running (5m40.0s), 134/600 VUs, 36740 complete and 0 interrupted iterations
default   [  97% ] 134/600 VUs  3m53.7s/4m00.0s

running (5m41.0s), 119/600 VUs, 36874 complete and 0 interrupted iterations
default   [  98% ] 119/600 VUs  3m54.7s/4m00.0s

running (5m42.0s), 094/600 VUs, 36994 complete and 0 interrupted iterations
default   [  98% ] 094/600 VUs  3m55.7s/4m00.0s

running (5m43.0s), 081/600 VUs, 37098 complete and 0 interrupted iterations
default   [  99% ] 081/600 VUs  3m56.7s/4m00.0s

running (5m44.0s), 055/600 VUs, 37188 complete and 0 interrupted iterations
default   [  99% ] 055/600 VUs  3m57.7s/4m00.0s

running (5m45.0s), 032/600 VUs, 37249 complete and 0 interrupted iterations
default   [  99% ] 032/600 VUs  3m58.7s/4m00.0s

running (5m46.0s), 013/600 VUs, 37282 complete and 0 interrupted iterations
default   [ 100% ] 013/600 VUs  3m59.7s/4m00.0s


  █ THRESHOLDS 

    http_req_duration
    ✓ 'p(95)<2500' p(95)=462.79ms

    http_req_failed
    ✓ 'rate<0.05' rate=0.00%


  █ TOTAL RESULTS 

    checks_total.......: 111885  322.544499/s
    checks_succeeded...: 100.00% 111885 out of 111885
    checks_failed......: 0.00%   0 out of 111885

    ✓ list 200
    ✓ before 200
    ✓ sync 200

    HTTP
    http_req_duration..............: avg=139.48ms min=2.84ms   med=74.41ms max=1.36s p(90)=375.83ms p(95)=462.79ms
      { expected_response:true }...: avg=139.48ms min=2.84ms   med=74.41ms max=1.36s p(90)=375.83ms p(95)=462.79ms
    http_req_failed................: 0.00%  0 out of 121497
    http_reqs......................: 121497 350.254181/s

    EXECUTION
    iteration_duration.............: avg=1.35s    min=927.28ms med=1.23s   max=3.39s p(90)=1.99s    p(95)=2.17s   
    iterations.....................: 37295  107.514833/s
    vus............................: 13     min=0           max=600
    vus_max........................: 600    min=600         max=600

    NETWORK
    data_received..................: 1.3 GB 3.7 MB/s
    data_sent......................: 47 MB  134 kB/s




running (5m46.9s), 000/600 VUs, 37295 complete and 0 interrupted iterations
default ✓ [ 100% ] 000/600 VUs  4m0s

================================================================
% cd DomainCommunity/voting && k6 run voting-load.js
================================================================


         /\      Grafana   /‾‾/  
    /\  /  \     |\  __   /  /   
   /  \/    \    | |/ /  /   ‾‾\ 
  /          \   |   (  |  (‾)  |
 / __________ \  |_|\_\  \_____/ 


     execution: local
        script: voting-load.js
        output: -

     scenarios: (100.00%) 3 scenarios, 210 max VUs, 2m30s max duration (incl. graceful stop):
              * manage: 21 looping VUs for 2m0s (exec: manageVotings, gracefulStop: 30s)
              * read: 84 looping VUs for 2m0s (exec: readVotings, gracefulStop: 30s)
              * vote: 105 looping VUs for 2m0s (exec: castVotes, gracefulStop: 30s)


Run      [ 100% ] setup()
manage   [   0% ]
read     [   0% ]
vote     [   0% ]

Run      [ 100% ] setup()
manage   [   0% ]
read     [   0% ]
vote     [   0% ]

Run      [ 100% ] setup()
manage   [   0% ]
read     [   0% ]
vote     [   0% ]

Run      [ 100% ] setup()
manage   [   0% ]
read     [   0% ]
vote     [   0% ]

Run      [ 100% ] setup()
manage   [   0% ]
read     [   0% ]
vote     [   0% ]

Run      [ 100% ] setup()
manage   [   0% ]
read     [   0% ]
vote     [   0% ]

Run      [ 100% ] setup()
manage   [   0% ]
read     [   0% ]
vote     [   0% ]

running (0m08.0s), 210/210 VUs, 91 complete and 0 interrupted iterations
manage   [   0% ] 21 VUs   0m00.5s/2m0s
read     [   0% ] 84 VUs   0m00.5s/2m0s
vote     [   0% ] 105 VUs  0m00.5s/2m0s

running (0m09.0s), 210/210 VUs, 570 complete and 0 interrupted iterations
manage   [   1% ] 21 VUs   0m01.5s/2m0s
read     [   1% ] 84 VUs   0m01.5s/2m0s
vote     [   1% ] 105 VUs  0m01.5s/2m0s

running (0m10.0s), 210/210 VUs, 1008 complete and 0 interrupted iterations
manage   [   2% ] 21 VUs   0m02.5s/2m0s
read     [   2% ] 84 VUs   0m02.5s/2m0s
vote     [   2% ] 105 VUs  0m02.5s/2m0s

running (0m11.0s), 210/210 VUs, 1523 complete and 0 interrupted iterations
manage   [   3% ] 21 VUs   0m03.5s/2m0s
read     [   3% ] 84 VUs   0m03.5s/2m0s
vote     [   3% ] 105 VUs  0m03.5s/2m0s

running (0m12.0s), 210/210 VUs, 2007 complete and 0 interrupted iterations
manage   [   4% ] 21 VUs   0m04.5s/2m0s
read     [   4% ] 84 VUs   0m04.5s/2m0s
vote     [   4% ] 105 VUs  0m04.5s/2m0s

running (0m13.0s), 210/210 VUs, 2513 complete and 0 interrupted iterations
manage   [   5% ] 21 VUs   0m05.5s/2m0s
read     [   5% ] 84 VUs   0m05.5s/2m0s
vote     [   5% ] 105 VUs  0m05.5s/2m0s

running (0m14.0s), 210/210 VUs, 3013 complete and 0 interrupted iterations
manage   [   5% ] 21 VUs   0m06.5s/2m0s
read     [   5% ] 84 VUs   0m06.5s/2m0s
vote     [   5% ] 105 VUs  0m06.5s/2m0s

running (0m15.0s), 210/210 VUs, 3519 complete and 0 interrupted iterations
manage   [   6% ] 21 VUs   0m07.5s/2m0s
read     [   6% ] 84 VUs   0m07.5s/2m0s
vote     [   6% ] 105 VUs  0m07.5s/2m0s

running (0m16.0s), 210/210 VUs, 4032 complete and 0 interrupted iterations
manage   [   7% ] 21 VUs   0m08.5s/2m0s
read     [   7% ] 84 VUs   0m08.5s/2m0s
vote     [   7% ] 105 VUs  0m08.5s/2m0s

running (0m17.0s), 210/210 VUs, 4523 complete and 0 interrupted iterations
manage   [   8% ] 21 VUs   0m09.5s/2m0s
read     [   8% ] 84 VUs   0m09.5s/2m0s
vote     [   8% ] 105 VUs  0m09.5s/2m0s

running (0m18.0s), 210/210 VUs, 5023 complete and 0 interrupted iterations
manage   [   9% ] 21 VUs   0m10.5s/2m0s
read     [   9% ] 84 VUs   0m10.5s/2m0s
vote     [   9% ] 105 VUs  0m10.5s/2m0s

running (0m19.0s), 210/210 VUs, 5522 complete and 0 interrupted iterations
manage   [  10% ] 21 VUs   0m11.5s/2m0s
read     [  10% ] 84 VUs   0m11.5s/2m0s
vote     [  10% ] 105 VUs  0m11.5s/2m0s

running (0m20.0s), 210/210 VUs, 6038 complete and 0 interrupted iterations
manage   [  10% ] 21 VUs   0m12.5s/2m0s
read     [  10% ] 84 VUs   0m12.5s/2m0s
vote     [  10% ] 105 VUs  0m12.5s/2m0s

running (0m21.0s), 210/210 VUs, 6530 complete and 0 interrupted iterations
manage   [  11% ] 21 VUs   0m13.5s/2m0s
read     [  11% ] 84 VUs   0m13.5s/2m0s
vote     [  11% ] 105 VUs  0m13.5s/2m0s

running (0m22.0s), 210/210 VUs, 7023 complete and 0 interrupted iterations
manage   [  12% ] 21 VUs   0m14.5s/2m0s
read     [  12% ] 84 VUs   0m14.5s/2m0s
vote     [  12% ] 105 VUs  0m14.5s/2m0s

running (0m23.0s), 210/210 VUs, 7533 complete and 0 interrupted iterations
manage   [  13% ] 21 VUs   0m15.5s/2m0s
read     [  13% ] 84 VUs   0m15.5s/2m0s
vote     [  13% ] 105 VUs  0m15.5s/2m0s

running (0m24.0s), 210/210 VUs, 8022 complete and 0 interrupted iterations
manage   [  14% ] 21 VUs   0m16.5s/2m0s
read     [  14% ] 84 VUs   0m16.5s/2m0s
vote     [  14% ] 105 VUs  0m16.5s/2m0s

running (0m25.0s), 210/210 VUs, 8543 complete and 0 interrupted iterations
manage   [  15% ] 21 VUs   0m17.5s/2m0s
read     [  15% ] 84 VUs   0m17.5s/2m0s
vote     [  15% ] 105 VUs  0m17.5s/2m0s

running (0m26.0s), 210/210 VUs, 9038 complete and 0 interrupted iterations
manage   [  15% ] 21 VUs   0m18.5s/2m0s
read     [  15% ] 84 VUs   0m18.5s/2m0s
vote     [  15% ] 105 VUs  0m18.5s/2m0s

running (0m27.0s), 210/210 VUs, 9543 complete and 0 interrupted iterations
manage   [  16% ] 21 VUs   0m19.5s/2m0s
read     [  16% ] 84 VUs   0m19.5s/2m0s
vote     [  16% ] 105 VUs  0m19.5s/2m0s

running (0m28.0s), 210/210 VUs, 10051 complete and 0 interrupted iterations
manage   [  17% ] 21 VUs   0m20.5s/2m0s
read     [  17% ] 84 VUs   0m20.5s/2m0s
vote     [  17% ] 105 VUs  0m20.5s/2m0s

running (0m29.0s), 210/210 VUs, 10547 complete and 0 interrupted iterations
manage   [  18% ] 21 VUs   0m21.5s/2m0s
read     [  18% ] 84 VUs   0m21.5s/2m0s
vote     [  18% ] 105 VUs  0m21.5s/2m0s

running (0m30.0s), 210/210 VUs, 11057 complete and 0 interrupted iterations
manage   [  19% ] 21 VUs   0m22.5s/2m0s
read     [  19% ] 84 VUs   0m22.5s/2m0s
vote     [  19% ] 105 VUs  0m22.5s/2m0s

running (0m31.0s), 210/210 VUs, 11553 complete and 0 interrupted iterations
manage   [  20% ] 21 VUs   0m23.5s/2m0s
read     [  20% ] 84 VUs   0m23.5s/2m0s
vote     [  20% ] 105 VUs  0m23.5s/2m0s

running (0m32.0s), 210/210 VUs, 12056 complete and 0 interrupted iterations
manage   [  20% ] 21 VUs   0m24.5s/2m0s
read     [  20% ] 84 VUs   0m24.5s/2m0s
vote     [  20% ] 105 VUs  0m24.5s/2m0s

running (0m33.0s), 210/210 VUs, 12549 complete and 0 interrupted iterations
manage   [  21% ] 21 VUs   0m25.5s/2m0s
read     [  21% ] 84 VUs   0m25.5s/2m0s
vote     [  21% ] 105 VUs  0m25.5s/2m0s

running (0m34.0s), 210/210 VUs, 13046 complete and 0 interrupted iterations
manage   [  22% ] 21 VUs   0m26.5s/2m0s
read     [  22% ] 84 VUs   0m26.5s/2m0s
vote     [  22% ] 105 VUs  0m26.5s/2m0s

running (0m35.0s), 210/210 VUs, 13565 complete and 0 interrupted iterations
manage   [  23% ] 21 VUs   0m27.5s/2m0s
read     [  23% ] 84 VUs   0m27.5s/2m0s
vote     [  23% ] 105 VUs  0m27.5s/2m0s

running (0m36.0s), 210/210 VUs, 14061 complete and 0 interrupted iterations
manage   [  24% ] 21 VUs   0m28.5s/2m0s
read     [  24% ] 84 VUs   0m28.5s/2m0s
vote     [  24% ] 105 VUs  0m28.5s/2m0s

running (0m37.0s), 210/210 VUs, 14573 complete and 0 interrupted iterations
manage   [  25% ] 21 VUs   0m29.5s/2m0s
read     [  25% ] 84 VUs   0m29.5s/2m0s
vote     [  25% ] 105 VUs  0m29.5s/2m0s

running (0m38.0s), 210/210 VUs, 15069 complete and 0 interrupted iterations
manage   [  25% ] 21 VUs   0m30.5s/2m0s
read     [  25% ] 84 VUs   0m30.5s/2m0s
vote     [  25% ] 105 VUs  0m30.5s/2m0s

running (0m39.0s), 210/210 VUs, 15567 complete and 0 interrupted iterations
manage   [  26% ] 21 VUs   0m31.5s/2m0s
read     [  26% ] 84 VUs   0m31.5s/2m0s
vote     [  26% ] 105 VUs  0m31.5s/2m0s

running (0m40.0s), 210/210 VUs, 16077 complete and 0 interrupted iterations
manage   [  27% ] 21 VUs   0m32.5s/2m0s
read     [  27% ] 84 VUs   0m32.5s/2m0s
vote     [  27% ] 105 VUs  0m32.5s/2m0s

running (0m41.0s), 210/210 VUs, 16570 complete and 0 interrupted iterations
manage   [  28% ] 21 VUs   0m33.5s/2m0s
read     [  28% ] 84 VUs   0m33.5s/2m0s
vote     [  28% ] 105 VUs  0m33.5s/2m0s

running (0m42.0s), 210/210 VUs, 17079 complete and 0 interrupted iterations
manage   [  29% ] 21 VUs   0m34.5s/2m0s
read     [  29% ] 84 VUs   0m34.5s/2m0s
vote     [  29% ] 105 VUs  0m34.5s/2m0s

running (0m43.0s), 210/210 VUs, 17572 complete and 0 interrupted iterations
manage   [  30% ] 21 VUs   0m35.5s/2m0s
read     [  30% ] 84 VUs   0m35.5s/2m0s
vote     [  30% ] 105 VUs  0m35.5s/2m0s

running (0m44.0s), 210/210 VUs, 18087 complete and 0 interrupted iterations
manage   [  30% ] 21 VUs   0m36.5s/2m0s
read     [  30% ] 84 VUs   0m36.5s/2m0s
vote     [  30% ] 105 VUs  0m36.5s/2m0s

running (0m45.0s), 210/210 VUs, 18578 complete and 0 interrupted iterations
manage   [  31% ] 21 VUs   0m37.5s/2m0s
read     [  31% ] 84 VUs   0m37.5s/2m0s
vote     [  31% ] 105 VUs  0m37.5s/2m0s

running (0m46.0s), 210/210 VUs, 19074 complete and 0 interrupted iterations
manage   [  32% ] 21 VUs   0m38.5s/2m0s
read     [  32% ] 84 VUs   0m38.5s/2m0s
vote     [  32% ] 105 VUs  0m38.5s/2m0s

running (0m47.0s), 210/210 VUs, 19578 complete and 0 interrupted iterations
manage   [  33% ] 21 VUs   0m39.5s/2m0s
read     [  33% ] 84 VUs   0m39.5s/2m0s
vote     [  33% ] 105 VUs  0m39.5s/2m0s

running (0m48.0s), 210/210 VUs, 20078 complete and 0 interrupted iterations
manage   [  34% ] 21 VUs   0m40.5s/2m0s
read     [  34% ] 84 VUs   0m40.5s/2m0s
vote     [  34% ] 105 VUs  0m40.5s/2m0s

running (0m49.0s), 210/210 VUs, 20590 complete and 0 interrupted iterations
manage   [  35% ] 21 VUs   0m41.5s/2m0s
read     [  35% ] 84 VUs   0m41.5s/2m0s
vote     [  35% ] 105 VUs  0m41.5s/2m0s

running (0m50.0s), 210/210 VUs, 21091 complete and 0 interrupted iterations
manage   [  35% ] 21 VUs   0m42.5s/2m0s
read     [  35% ] 84 VUs   0m42.5s/2m0s
vote     [  35% ] 105 VUs  0m42.5s/2m0s

running (0m51.0s), 210/210 VUs, 21606 complete and 0 interrupted iterations
manage   [  36% ] 21 VUs   0m43.5s/2m0s
read     [  36% ] 84 VUs   0m43.5s/2m0s
vote     [  36% ] 105 VUs  0m43.5s/2m0s

running (0m52.0s), 210/210 VUs, 22093 complete and 0 interrupted iterations
manage   [  37% ] 21 VUs   0m44.5s/2m0s
read     [  37% ] 84 VUs   0m44.5s/2m0s
vote     [  37% ] 105 VUs  0m44.5s/2m0s

running (0m53.0s), 210/210 VUs, 22587 complete and 0 interrupted iterations
manage   [  38% ] 21 VUs   0m45.5s/2m0s
read     [  38% ] 84 VUs   0m45.5s/2m0s
vote     [  38% ] 105 VUs  0m45.5s/2m0s

running (0m54.0s), 210/210 VUs, 23096 complete and 0 interrupted iterations
manage   [  39% ] 21 VUs   0m46.5s/2m0s
read     [  39% ] 84 VUs   0m46.5s/2m0s
vote     [  39% ] 105 VUs  0m46.5s/2m0s

running (0m55.0s), 210/210 VUs, 23589 complete and 0 interrupted iterations
manage   [  40% ] 21 VUs   0m47.5s/2m0s
read     [  40% ] 84 VUs   0m47.5s/2m0s
vote     [  40% ] 105 VUs  0m47.5s/2m0s

running (0m56.0s), 210/210 VUs, 24106 complete and 0 interrupted iterations
manage   [  40% ] 21 VUs   0m48.5s/2m0s
read     [  40% ] 84 VUs   0m48.5s/2m0s
vote     [  40% ] 105 VUs  0m48.5s/2m0s

running (0m57.0s), 210/210 VUs, 24599 complete and 0 interrupted iterations
manage   [  41% ] 21 VUs   0m49.5s/2m0s
read     [  41% ] 84 VUs   0m49.5s/2m0s
vote     [  41% ] 105 VUs  0m49.5s/2m0s

running (0m58.0s), 210/210 VUs, 25100 complete and 0 interrupted iterations
manage   [  42% ] 21 VUs   0m50.5s/2m0s
read     [  42% ] 84 VUs   0m50.5s/2m0s
vote     [  42% ] 105 VUs  0m50.5s/2m0s

running (0m59.0s), 210/210 VUs, 25617 complete and 0 interrupted iterations
manage   [  43% ] 21 VUs   0m51.5s/2m0s
read     [  43% ] 84 VUs   0m51.5s/2m0s
vote     [  43% ] 105 VUs  0m51.5s/2m0s

running (1m00.0s), 210/210 VUs, 26115 complete and 0 interrupted iterations
manage   [  44% ] 21 VUs   0m52.5s/2m0s
read     [  44% ] 84 VUs   0m52.5s/2m0s
vote     [  44% ] 105 VUs  0m52.5s/2m0s

running (1m01.0s), 210/210 VUs, 26625 complete and 0 interrupted iterations
manage   [  45% ] 21 VUs   0m53.5s/2m0s
read     [  45% ] 84 VUs   0m53.5s/2m0s
vote     [  45% ] 105 VUs  0m53.5s/2m0s

running (1m02.0s), 210/210 VUs, 27113 complete and 0 interrupted iterations
manage   [  45% ] 21 VUs   0m54.5s/2m0s
read     [  45% ] 84 VUs   0m54.5s/2m0s
vote     [  45% ] 105 VUs  0m54.5s/2m0s

running (1m03.0s), 210/210 VUs, 27632 complete and 0 interrupted iterations
manage   [  46% ] 21 VUs   0m55.5s/2m0s
read     [  46% ] 84 VUs   0m55.5s/2m0s
vote     [  46% ] 105 VUs  0m55.5s/2m0s

running (1m04.0s), 210/210 VUs, 28120 complete and 0 interrupted iterations
manage   [  47% ] 21 VUs   0m56.5s/2m0s
read     [  47% ] 84 VUs   0m56.5s/2m0s
vote     [  47% ] 105 VUs  0m56.5s/2m0s

running (1m05.0s), 210/210 VUs, 28621 complete and 0 interrupted iterations
manage   [  48% ] 21 VUs   0m57.5s/2m0s
read     [  48% ] 84 VUs   0m57.5s/2m0s
vote     [  48% ] 105 VUs  0m57.5s/2m0s

running (1m06.0s), 210/210 VUs, 29124 complete and 0 interrupted iterations
manage   [  49% ] 21 VUs   0m58.5s/2m0s
read     [  49% ] 84 VUs   0m58.5s/2m0s
vote     [  49% ] 105 VUs  0m58.5s/2m0s

running (1m07.0s), 210/210 VUs, 29617 complete and 0 interrupted iterations
manage   [  50% ] 21 VUs   0m59.5s/2m0s
read     [  50% ] 84 VUs   0m59.5s/2m0s
vote     [  50% ] 105 VUs  0m59.5s/2m0s

running (1m08.0s), 210/210 VUs, 30140 complete and 0 interrupted iterations
manage   [  50% ] 21 VUs   1m00.5s/2m0s
read     [  50% ] 84 VUs   1m00.5s/2m0s
vote     [  50% ] 105 VUs  1m00.5s/2m0s

running (1m09.0s), 210/210 VUs, 30632 complete and 0 interrupted iterations
manage   [  51% ] 21 VUs   1m01.5s/2m0s
read     [  51% ] 84 VUs   1m01.5s/2m0s
vote     [  51% ] 105 VUs  1m01.5s/2m0s

running (1m10.0s), 210/210 VUs, 31154 complete and 0 interrupted iterations
manage   [  52% ] 21 VUs   1m02.5s/2m0s
read     [  52% ] 84 VUs   1m02.5s/2m0s
vote     [  52% ] 105 VUs  1m02.5s/2m0s

running (1m11.0s), 210/210 VUs, 31644 complete and 0 interrupted iterations
manage   [  53% ] 21 VUs   1m03.5s/2m0s
read     [  53% ] 84 VUs   1m03.5s/2m0s
vote     [  53% ] 105 VUs  1m03.5s/2m0s

running (1m12.0s), 210/210 VUs, 32146 complete and 0 interrupted iterations
manage   [  54% ] 21 VUs   1m04.5s/2m0s
read     [  54% ] 84 VUs   1m04.5s/2m0s
vote     [  54% ] 105 VUs  1m04.5s/2m0s

running (1m13.0s), 210/210 VUs, 32653 complete and 0 interrupted iterations
manage   [  55% ] 21 VUs   1m05.5s/2m0s
read     [  55% ] 84 VUs   1m05.5s/2m0s
vote     [  55% ] 105 VUs  1m05.5s/2m0s

running (1m14.0s), 210/210 VUs, 33142 complete and 0 interrupted iterations
manage   [  55% ] 21 VUs   1m06.5s/2m0s
read     [  55% ] 84 VUs   1m06.5s/2m0s
vote     [  55% ] 105 VUs  1m06.5s/2m0s

running (1m15.0s), 210/210 VUs, 33645 complete and 0 interrupted iterations
manage   [  56% ] 21 VUs   1m07.5s/2m0s
read     [  56% ] 84 VUs   1m07.5s/2m0s
vote     [  56% ] 105 VUs  1m07.5s/2m0s

running (1m16.0s), 210/210 VUs, 34145 complete and 0 interrupted iterations
manage   [  57% ] 21 VUs   1m08.5s/2m0s
read     [  57% ] 84 VUs   1m08.5s/2m0s
vote     [  57% ] 105 VUs  1m08.5s/2m0s

running (1m17.0s), 210/210 VUs, 34645 complete and 0 interrupted iterations
manage   [  58% ] 21 VUs   1m09.5s/2m0s
read     [  58% ] 84 VUs   1m09.5s/2m0s
vote     [  58% ] 105 VUs  1m09.5s/2m0s

running (1m18.0s), 210/210 VUs, 35155 complete and 0 interrupted iterations
manage   [  59% ] 21 VUs   1m10.5s/2m0s
read     [  59% ] 84 VUs   1m10.5s/2m0s
vote     [  59% ] 105 VUs  1m10.5s/2m0s

running (1m19.0s), 210/210 VUs, 35656 complete and 0 interrupted iterations
manage   [  60% ] 21 VUs   1m11.5s/2m0s
read     [  60% ] 84 VUs   1m11.5s/2m0s
vote     [  60% ] 105 VUs  1m11.5s/2m0s

running (1m20.0s), 210/210 VUs, 36176 complete and 0 interrupted iterations
manage   [  60% ] 21 VUs   1m12.5s/2m0s
read     [  60% ] 84 VUs   1m12.5s/2m0s
vote     [  60% ] 105 VUs  1m12.5s/2m0s

running (1m21.0s), 210/210 VUs, 36667 complete and 0 interrupted iterations
manage   [  61% ] 21 VUs   1m13.5s/2m0s
read     [  61% ] 84 VUs   1m13.5s/2m0s
vote     [  61% ] 105 VUs  1m13.5s/2m0s

running (1m22.0s), 210/210 VUs, 37172 complete and 0 interrupted iterations
manage   [  62% ] 21 VUs   1m14.5s/2m0s
read     [  62% ] 84 VUs   1m14.5s/2m0s
vote     [  62% ] 105 VUs  1m14.5s/2m0s

running (1m23.0s), 210/210 VUs, 37669 complete and 0 interrupted iterations
manage   [  63% ] 21 VUs   1m15.5s/2m0s
read     [  63% ] 84 VUs   1m15.5s/2m0s
vote     [  63% ] 105 VUs  1m15.5s/2m0s

running (1m24.0s), 210/210 VUs, 38176 complete and 0 interrupted iterations
manage   [  64% ] 21 VUs   1m16.5s/2m0s
read     [  64% ] 84 VUs   1m16.5s/2m0s
vote     [  64% ] 105 VUs  1m16.5s/2m0s

running (1m25.0s), 210/210 VUs, 38683 complete and 0 interrupted iterations
manage   [  65% ] 21 VUs   1m17.5s/2m0s
read     [  65% ] 84 VUs   1m17.5s/2m0s
vote     [  65% ] 105 VUs  1m17.5s/2m0s

running (1m26.0s), 210/210 VUs, 39180 complete and 0 interrupted iterations
manage   [  65% ] 21 VUs   1m18.5s/2m0s
read     [  65% ] 84 VUs   1m18.5s/2m0s
vote     [  65% ] 105 VUs  1m18.5s/2m0s

running (1m27.0s), 210/210 VUs, 39688 complete and 0 interrupted iterations
manage   [  66% ] 21 VUs   1m19.5s/2m0s
read     [  66% ] 84 VUs   1m19.5s/2m0s
vote     [  66% ] 105 VUs  1m19.5s/2m0s

running (1m28.0s), 210/210 VUs, 40184 complete and 0 interrupted iterations
manage   [  67% ] 21 VUs   1m20.5s/2m0s
read     [  67% ] 84 VUs   1m20.5s/2m0s
vote     [  67% ] 105 VUs  1m20.5s/2m0s

running (1m29.0s), 210/210 VUs, 40684 complete and 0 interrupted iterations
manage   [  68% ] 21 VUs   1m21.5s/2m0s
read     [  68% ] 84 VUs   1m21.5s/2m0s
vote     [  68% ] 105 VUs  1m21.5s/2m0s

running (1m30.0s), 210/210 VUs, 41191 complete and 0 interrupted iterations
manage   [  69% ] 21 VUs   1m22.5s/2m0s
read     [  69% ] 84 VUs   1m22.5s/2m0s
vote     [  69% ] 105 VUs  1m22.5s/2m0s

running (1m31.0s), 210/210 VUs, 41701 complete and 0 interrupted iterations
manage   [  70% ] 21 VUs   1m23.5s/2m0s
read     [  70% ] 84 VUs   1m23.5s/2m0s
vote     [  70% ] 105 VUs  1m23.5s/2m0s

running (1m32.0s), 210/210 VUs, 42213 complete and 0 interrupted iterations
manage   [  70% ] 21 VUs   1m24.5s/2m0s
read     [  70% ] 84 VUs   1m24.5s/2m0s
vote     [  70% ] 105 VUs  1m24.5s/2m0s

running (1m33.0s), 210/210 VUs, 42697 complete and 0 interrupted iterations
manage   [  71% ] 21 VUs   1m25.5s/2m0s
read     [  71% ] 84 VUs   1m25.5s/2m0s
vote     [  71% ] 105 VUs  1m25.5s/2m0s

running (1m34.0s), 210/210 VUs, 43199 complete and 0 interrupted iterations
manage   [  72% ] 21 VUs   1m26.5s/2m0s
read     [  72% ] 84 VUs   1m26.5s/2m0s
vote     [  72% ] 105 VUs  1m26.5s/2m0s

running (1m35.0s), 210/210 VUs, 43700 complete and 0 interrupted iterations
manage   [  73% ] 21 VUs   1m27.5s/2m0s
read     [  73% ] 84 VUs   1m27.5s/2m0s
vote     [  73% ] 105 VUs  1m27.5s/2m0s

running (1m36.0s), 210/210 VUs, 44192 complete and 0 interrupted iterations
manage   [  74% ] 21 VUs   1m28.5s/2m0s
read     [  74% ] 84 VUs   1m28.5s/2m0s
vote     [  74% ] 105 VUs  1m28.5s/2m0s

running (1m37.0s), 210/210 VUs, 44706 complete and 0 interrupted iterations
manage   [  75% ] 21 VUs   1m29.5s/2m0s
read     [  75% ] 84 VUs   1m29.5s/2m0s
vote     [  75% ] 105 VUs  1m29.5s/2m0s

running (1m38.0s), 210/210 VUs, 45214 complete and 0 interrupted iterations
manage   [  75% ] 21 VUs   1m30.5s/2m0s
read     [  75% ] 84 VUs   1m30.5s/2m0s
vote     [  75% ] 105 VUs  1m30.5s/2m0s

running (1m39.0s), 210/210 VUs, 45719 complete and 0 interrupted iterations
manage   [  76% ] 21 VUs   1m31.5s/2m0s
read     [  76% ] 84 VUs   1m31.5s/2m0s
vote     [  76% ] 105 VUs  1m31.5s/2m0s

running (1m40.0s), 210/210 VUs, 46219 complete and 0 interrupted iterations
manage   [  77% ] 21 VUs   1m32.5s/2m0s
read     [  77% ] 84 VUs   1m32.5s/2m0s
vote     [  77% ] 105 VUs  1m32.5s/2m0s

running (1m41.0s), 210/210 VUs, 46726 complete and 0 interrupted iterations
manage   [  78% ] 21 VUs   1m33.5s/2m0s
read     [  78% ] 84 VUs   1m33.5s/2m0s
vote     [  78% ] 105 VUs  1m33.5s/2m0s

running (1m42.0s), 210/210 VUs, 47231 complete and 0 interrupted iterations
manage   [  79% ] 21 VUs   1m34.5s/2m0s
read     [  79% ] 84 VUs   1m34.5s/2m0s
vote     [  79% ] 105 VUs  1m34.5s/2m0s

running (1m43.0s), 210/210 VUs, 47723 complete and 0 interrupted iterations
manage   [  80% ] 21 VUs   1m35.5s/2m0s
read     [  80% ] 84 VUs   1m35.5s/2m0s
vote     [  80% ] 105 VUs  1m35.5s/2m0s

running (1m44.0s), 210/210 VUs, 48226 complete and 0 interrupted iterations
manage   [  80% ] 21 VUs   1m36.5s/2m0s
read     [  80% ] 84 VUs   1m36.5s/2m0s
vote     [  80% ] 105 VUs  1m36.5s/2m0s

running (1m45.0s), 210/210 VUs, 48726 complete and 0 interrupted iterations
manage   [  81% ] 21 VUs   1m37.5s/2m0s
read     [  81% ] 84 VUs   1m37.5s/2m0s
vote     [  81% ] 105 VUs  1m37.5s/2m0s

running (1m46.0s), 210/210 VUs, 49233 complete and 0 interrupted iterations
manage   [  82% ] 21 VUs   1m38.5s/2m0s
read     [  82% ] 84 VUs   1m38.5s/2m0s
vote     [  82% ] 105 VUs  1m38.5s/2m0s

running (1m47.0s), 210/210 VUs, 49734 complete and 0 interrupted iterations
manage   [  83% ] 21 VUs   1m39.5s/2m0s
read     [  83% ] 84 VUs   1m39.5s/2m0s
vote     [  83% ] 105 VUs  1m39.5s/2m0s

running (1m48.0s), 210/210 VUs, 50233 complete and 0 interrupted iterations
manage   [  84% ] 21 VUs   1m40.5s/2m0s
read     [  84% ] 84 VUs   1m40.5s/2m0s
vote     [  84% ] 105 VUs  1m40.5s/2m0s

running (1m49.0s), 210/210 VUs, 50748 complete and 0 interrupted iterations
manage   [  85% ] 21 VUs   1m41.5s/2m0s
read     [  85% ] 84 VUs   1m41.5s/2m0s
vote     [  85% ] 105 VUs  1m41.5s/2m0s

running (1m50.0s), 210/210 VUs, 51251 complete and 0 interrupted iterations
manage   [  85% ] 21 VUs   1m42.5s/2m0s
read     [  85% ] 84 VUs   1m42.5s/2m0s
vote     [  85% ] 105 VUs  1m42.5s/2m0s

running (1m51.0s), 210/210 VUs, 51760 complete and 0 interrupted iterations
manage   [  86% ] 21 VUs   1m43.5s/2m0s
read     [  86% ] 84 VUs   1m43.5s/2m0s
vote     [  86% ] 105 VUs  1m43.5s/2m0s

running (1m52.0s), 210/210 VUs, 52254 complete and 0 interrupted iterations
manage   [  87% ] 21 VUs   1m44.5s/2m0s
read     [  87% ] 84 VUs   1m44.5s/2m0s
vote     [  87% ] 105 VUs  1m44.5s/2m0s

running (1m53.0s), 210/210 VUs, 52742 complete and 0 interrupted iterations
manage   [  88% ] 21 VUs   1m45.5s/2m0s
read     [  88% ] 84 VUs   1m45.5s/2m0s
vote     [  88% ] 105 VUs  1m45.5s/2m0s

running (1m54.0s), 210/210 VUs, 53251 complete and 0 interrupted iterations
manage   [  89% ] 21 VUs   1m46.5s/2m0s
read     [  89% ] 84 VUs   1m46.5s/2m0s
vote     [  89% ] 105 VUs  1m46.5s/2m0s

running (1m55.0s), 210/210 VUs, 53749 complete and 0 interrupted iterations
manage   [  90% ] 21 VUs   1m47.5s/2m0s
read     [  90% ] 84 VUs   1m47.5s/2m0s
vote     [  90% ] 105 VUs  1m47.5s/2m0s

running (1m56.0s), 210/210 VUs, 54249 complete and 0 interrupted iterations
manage   [  90% ] 21 VUs   1m48.5s/2m0s
read     [  90% ] 84 VUs   1m48.5s/2m0s
vote     [  90% ] 105 VUs  1m48.5s/2m0s

running (1m57.0s), 210/210 VUs, 54765 complete and 0 interrupted iterations
manage   [  91% ] 21 VUs   1m49.5s/2m0s
read     [  91% ] 84 VUs   1m49.5s/2m0s
vote     [  91% ] 105 VUs  1m49.5s/2m0s

running (1m58.0s), 210/210 VUs, 55263 complete and 0 interrupted iterations
manage   [  92% ] 21 VUs   1m50.5s/2m0s
read     [  92% ] 84 VUs   1m50.5s/2m0s
vote     [  92% ] 105 VUs  1m50.5s/2m0s

running (1m59.0s), 210/210 VUs, 55761 complete and 0 interrupted iterations
manage   [  93% ] 21 VUs   1m51.5s/2m0s
read     [  93% ] 84 VUs   1m51.5s/2m0s
vote     [  93% ] 105 VUs  1m51.5s/2m0s

running (2m00.0s), 210/210 VUs, 56261 complete and 0 interrupted iterations
manage   [  94% ] 21 VUs   1m52.5s/2m0s
read     [  94% ] 84 VUs   1m52.5s/2m0s
vote     [  94% ] 105 VUs  1m52.5s/2m0s

running (2m01.0s), 210/210 VUs, 56764 complete and 0 interrupted iterations
manage   [  95% ] 21 VUs   1m53.5s/2m0s
read     [  95% ] 84 VUs   1m53.5s/2m0s
vote     [  95% ] 105 VUs  1m53.5s/2m0s

running (2m02.0s), 210/210 VUs, 57266 complete and 0 interrupted iterations
manage   [  95% ] 21 VUs   1m54.5s/2m0s
read     [  95% ] 84 VUs   1m54.5s/2m0s
vote     [  95% ] 105 VUs  1m54.5s/2m0s

running (2m03.0s), 210/210 VUs, 57765 complete and 0 interrupted iterations
manage   [  96% ] 21 VUs   1m55.5s/2m0s
read     [  96% ] 84 VUs   1m55.5s/2m0s
vote     [  96% ] 105 VUs  1m55.5s/2m0s

running (2m04.0s), 210/210 VUs, 58269 complete and 0 interrupted iterations
manage   [  97% ] 21 VUs   1m56.5s/2m0s
read     [  97% ] 84 VUs   1m56.5s/2m0s
vote     [  97% ] 105 VUs  1m56.5s/2m0s

running (2m05.0s), 210/210 VUs, 58772 complete and 0 interrupted iterations
manage   [  98% ] 21 VUs   1m57.5s/2m0s
read     [  98% ] 84 VUs   1m57.5s/2m0s
vote     [  98% ] 105 VUs  1m57.5s/2m0s

running (2m06.0s), 210/210 VUs, 59272 complete and 0 interrupted iterations
manage   [  99% ] 21 VUs   1m58.5s/2m0s
read     [  99% ] 84 VUs   1m58.5s/2m0s
vote     [  99% ] 105 VUs  1m58.5s/2m0s

running (2m07.0s), 210/210 VUs, 59777 complete and 0 interrupted iterations
manage   [ 100% ] 21 VUs   1m59.5s/2m0s
read     [ 100% ] 84 VUs   1m59.5s/2m0s
vote     [ 100% ] 105 VUs  1m59.5s/2m0s

running (2m08.0s), 024/210 VUs, 60210 complete and 0 interrupted iterations
manage ↓ [ 100% ] 21 VUs   2m0s
read   ↓ [ 100% ] 84 VUs   2m0s
vote   ✓ [ 100% ] 105 VUs  2m0s

running (2m09.0s), 018/210 VUs, 60216 complete and 0 interrupted iterations
manage ↓ [ 100% ] 21 VUs   2m0s
read   ✓ [ 100% ] 84 VUs   2m0s
vote   ✓ [ 100% ] 105 VUs  2m0s


  █ THRESHOLDS 

    http_req_duration
    ✓ 'p(95)<1000' p(95)=24.93ms

      {scenario:manage}
      ✓ 'p(95)<2000' p(95)=48.65ms

      {scenario:read}
      ✓ 'p(95)<500' p(95)=17.41ms

      {scenario:vote}
      ✓ 'p(95)<800' p(95)=24.44ms

    http_req_failed
    ✓ 'rate<0.01' rate=0.92%


  █ TOTAL RESULTS 

    checks_total.......: 80034  616.595445/s
    checks_succeeded...: 99.86% 79928 out of 80034
    checks_failed......: 0.13%  106 out of 80034

    ✓ owner register 201
    ✓ owner login 200
    ✓ create community 201
    ✓ create mgmt community 201
    ✓ create voting 201
    ✓ POST /vote 200
    ✓ GET /votings 200
    ✓ GET /votings/{id} 200
    ✗ close voting 200
      ↳  78% — ✓ 379 / ✗ 106

    HTTP
    http_req_duration..............: avg=14.37ms  min=2.85ms   med=12.54ms  max=285.48ms p(90)=20.64ms  p(95)=24.93ms 
      { expected_response:true }...: avg=14.41ms  min=2.98ms   med=12.58ms  max=285.48ms p(90)=20.66ms  p(95)=24.95ms 
      { scenario:manage }..........: avg=23.96ms  min=2.85ms   med=20.81ms  max=285.48ms p(90)=39.94ms  p(95)=48.65ms 
      { scenario:read }............: avg=11.54ms  min=2.98ms   med=10.25ms  max=262.98ms p(90)=14.74ms  p(95)=17.41ms 
      { scenario:vote }............: avg=16.21ms  min=4.85ms   med=15.3ms   max=262.94ms p(90)=21.53ms  p(95)=24.44ms 
    http_req_failed................: 0.92%  769 out of 83011
    http_reqs......................: 83011  639.530756/s

    EXECUTION
    iteration_duration.............: avg=419.62ms min=305.01ms med=318.46ms max=2.72s    p(90)=524.32ms p(95)=529.08ms
    iterations.....................: 60234  464.052903/s
    vus............................: 18     min=0            max=210
    vus_max........................: 210    min=210          max=210

    NETWORK
    data_received..................: 117 MB 901 kB/s
    data_sent......................: 35 MB  270 kB/s




running (2m09.8s), 000/210 VUs, 60234 complete and 0 interrupted iterations
manage ✓ [ 100% ] 21 VUs   2m0s
read   ✓ [ 100% ] 84 VUs   2m0s
vote   ✓ [ 100% ] 105 VUs  2m0s

================================================================
% cd DomainCommunity/voting && k6 run voting-spike.js
================================================================


         /\      Grafana   /‾‾/  
    /\  /  \     |\  __   /  /   
   /  \/    \    | |/ /  /   ‾‾\ 
  /          \   |   (  |  (‾)  |
 / __________ \  |_|\_\  \_____/ 


     execution: local
        script: voting-spike.js
        output: -

     scenarios: (100.00%) 1 scenario, 500 max VUs, 1m20s max duration (incl. graceful stop):
              * default: Up to 500 looping VUs for 50s over 5 stages (gracefulRampDown: 30s, gracefulStop: 30s)


Run       [ 100% ] setup()
default   [   0% ]

Run       [ 100% ] setup()
default   [   0% ]

Run       [ 100% ] setup()
default   [   0% ]

Run       [ 100% ] setup()
default   [   0% ]

running (0m05.0s), 001/500 VUs, 0 complete and 0 interrupted iterations
default   [   0% ] 001/500 VUs  00.1s/50.0s

running (0m06.0s), 008/500 VUs, 34 complete and 0 interrupted iterations
default   [   2% ] 008/500 VUs  01.1s/50.0s

running (0m07.0s), 015/500 VUs, 130 complete and 0 interrupted iterations
default   [   4% ] 015/500 VUs  02.1s/50.0s

running (0m08.0s), 022/500 VUs, 276 complete and 0 interrupted iterations
default   [   6% ] 022/500 VUs  03.1s/50.0s

running (0m09.0s), 029/500 VUs, 482 complete and 0 interrupted iterations
default   [   8% ] 029/500 VUs  04.1s/50.0s

running (0m10.0s), 036/500 VUs, 769 complete and 0 interrupted iterations
default   [  10% ] 036/500 VUs  05.1s/50.0s

running (0m11.0s), 042/500 VUs, 1092 complete and 0 interrupted iterations
default   [  12% ] 042/500 VUs  06.1s/50.0s

running (0m12.0s), 049/500 VUs, 1485 complete and 0 interrupted iterations
default   [  14% ] 049/500 VUs  07.1s/50.0s

running (0m13.0s), 056/500 VUs, 1943 complete and 0 interrupted iterations
default   [  16% ] 056/500 VUs  08.1s/50.0s

running (0m14.0s), 063/500 VUs, 2460 complete and 0 interrupted iterations
default   [  18% ] 063/500 VUs  09.1s/50.0s

running (0m15.0s), 076/500 VUs, 3036 complete and 0 interrupted iterations
default   [  20% ] 076/500 VUs  10.1s/50.0s

running (0m16.0s), 162/500 VUs, 3859 complete and 0 interrupted iterations
default   [  22% ] 162/500 VUs  11.1s/50.0s

running (0m17.0s), 248/500 VUs, 4732 complete and 0 interrupted iterations
default   [  24% ] 248/500 VUs  12.1s/50.0s

running (0m18.0s), 334/500 VUs, 5657 complete and 0 interrupted iterations
default   [  26% ] 334/500 VUs  13.1s/50.0s

running (0m19.0s), 420/500 VUs, 6513 complete and 0 interrupted iterations
default   [  28% ] 420/500 VUs  14.1s/50.0s

running (0m20.0s), 500/500 VUs, 7382 complete and 0 interrupted iterations
default   [  30% ] 500/500 VUs  15.1s/50.0s

running (0m21.0s), 500/500 VUs, 8260 complete and 0 interrupted iterations
default   [  32% ] 500/500 VUs  16.1s/50.0s

running (0m22.0s), 500/500 VUs, 9192 complete and 0 interrupted iterations
default   [  34% ] 500/500 VUs  17.1s/50.0s

running (0m23.0s), 500/500 VUs, 10132 complete and 0 interrupted iterations
default   [  36% ] 500/500 VUs  18.1s/50.0s

running (0m24.0s), 500/500 VUs, 11018 complete and 0 interrupted iterations
default   [  38% ] 500/500 VUs  19.1s/50.0s

running (0m25.0s), 500/500 VUs, 11927 complete and 0 interrupted iterations
default   [  40% ] 500/500 VUs  20.1s/50.0s

running (0m26.0s), 500/500 VUs, 12851 complete and 0 interrupted iterations
default   [  42% ] 500/500 VUs  21.1s/50.0s

running (0m27.0s), 500/500 VUs, 13754 complete and 0 interrupted iterations
default   [  44% ] 500/500 VUs  22.1s/50.0s

running (0m28.0s), 500/500 VUs, 14673 complete and 0 interrupted iterations
default   [  46% ] 500/500 VUs  23.1s/50.0s

running (0m29.0s), 500/500 VUs, 15519 complete and 0 interrupted iterations
default   [  48% ] 500/500 VUs  24.1s/50.0s

running (0m30.0s), 500/500 VUs, 16413 complete and 0 interrupted iterations
default   [  50% ] 500/500 VUs  25.1s/50.0s

running (0m31.0s), 500/500 VUs, 17310 complete and 0 interrupted iterations
default   [  52% ] 500/500 VUs  26.1s/50.0s

running (0m32.0s), 500/500 VUs, 18247 complete and 0 interrupted iterations
default   [  54% ] 500/500 VUs  27.1s/50.0s

running (0m33.0s), 500/500 VUs, 19160 complete and 0 interrupted iterations
default   [  56% ] 500/500 VUs  28.1s/50.0s

running (0m34.0s), 500/500 VUs, 20032 complete and 0 interrupted iterations
default   [  58% ] 500/500 VUs  29.1s/50.0s

running (0m35.0s), 500/500 VUs, 20951 complete and 0 interrupted iterations
default   [  60% ] 500/500 VUs  30.1s/50.0s

running (0m36.0s), 500/500 VUs, 21873 complete and 0 interrupted iterations
default   [  62% ] 500/500 VUs  31.1s/50.0s

running (0m37.0s), 500/500 VUs, 22781 complete and 0 interrupted iterations
default   [  64% ] 500/500 VUs  32.1s/50.0s

running (0m38.0s), 500/500 VUs, 23705 complete and 0 interrupted iterations
default   [  66% ] 500/500 VUs  33.1s/50.0s

running (0m39.0s), 500/500 VUs, 24627 complete and 0 interrupted iterations
default   [  68% ] 500/500 VUs  34.1s/50.0s

running (0m40.0s), 500/500 VUs, 25568 complete and 0 interrupted iterations
default   [  70% ] 500/500 VUs  35.1s/50.0s

running (0m41.0s), 437/500 VUs, 26476 complete and 0 interrupted iterations
default   [  72% ] 437/500 VUs  36.1s/50.0s

running (0m42.0s), 342/500 VUs, 27407 complete and 0 interrupted iterations
default   [  74% ] 342/500 VUs  37.1s/50.0s

running (0m43.0s), 251/500 VUs, 28311 complete and 0 interrupted iterations
default   [  76% ] 251/500 VUs  38.1s/50.0s

running (0m44.0s), 158/500 VUs, 29258 complete and 0 interrupted iterations
default   [  78% ] 158/500 VUs  39.1s/50.0s

running (0m45.0s), 071/500 VUs, 30154 complete and 0 interrupted iterations
default   [  80% ] 071/500 VUs  40.1s/50.0s

running (0m46.0s), 064/500 VUs, 30729 complete and 0 interrupted iterations
default   [  82% ] 064/500 VUs  41.1s/50.0s

running (0m47.0s), 057/500 VUs, 31228 complete and 0 interrupted iterations
default   [  84% ] 057/500 VUs  42.1s/50.0s

running (0m48.0s), 050/500 VUs, 31695 complete and 0 interrupted iterations
default   [  86% ] 050/500 VUs  43.1s/50.0s

running (0m49.0s), 042/500 VUs, 32112 complete and 0 interrupted iterations
default   [  88% ] 042/500 VUs  44.1s/50.0s

running (0m50.0s), 035/500 VUs, 32458 complete and 0 interrupted iterations
default   [  90% ] 035/500 VUs  45.1s/50.0s

running (0m51.0s), 029/500 VUs, 32722 complete and 0 interrupted iterations
default   [  92% ] 029/500 VUs  46.1s/50.0s

running (0m52.0s), 022/500 VUs, 32926 complete and 0 interrupted iterations
default   [  94% ] 022/500 VUs  47.1s/50.0s

running (0m53.0s), 014/500 VUs, 33074 complete and 0 interrupted iterations
default   [  96% ] 014/500 VUs  48.1s/50.0s

running (0m54.0s), 007/500 VUs, 33164 complete and 0 interrupted iterations
default   [  98% ] 007/500 VUs  49.1s/50.0s


  █ THRESHOLDS 

    http_req_duration
    ✓ 'p(95)<2000' p(95)=521.32ms

    http_req_failed
    ✓ 'rate<0.05' rate=0.00%


  █ TOTAL RESULTS 

    checks_total.......: 33192   604.106746/s
    checks_succeeded...: 100.00% 33192 out of 33192
    checks_failed......: 0.00%   0 out of 33192

    ✓ POST /vote 200

    HTTP
    http_req_duration..............: avg=307.21ms min=5.07ms   med=423.44ms max=1.1s p(90)=474.67ms p(95)=521.32ms
      { expected_response:true }...: avg=307.21ms min=5.07ms   med=423.44ms max=1.1s p(90)=474.67ms p(95)=521.32ms
    http_req_failed................: 0.00% 0 out of 33559
    http_reqs......................: 33559 610.786283/s

    EXECUTION
    iteration_duration.............: avg=410.73ms min=105.34ms med=524.64ms max=1.2s p(90)=575.21ms p(95)=623.6ms 
    iterations.....................: 33192 604.106746/s
    vus............................: 7     min=0          max=500
    vus_max........................: 500   min=500        max=500

    NETWORK
    data_received..................: 43 MB 789 kB/s
    data_sent......................: 16 MB 282 kB/s




running (0m54.9s), 000/500 VUs, 33192 complete and 0 interrupted iterations
default ✓ [ 100% ] 000/500 VUs  50s

================================================================
% cd DomainCommunity/voting && k6 run voting-stress.js
================================================================


         /\      Grafana   /‾‾/  
    /\  /  \     |\  __   /  /   
   /  \/    \    | |/ /  /   ‾‾\ 
  /          \   |   (  |  (‾)  |
 / __________ \  |_|\_\  \_____/ 


     execution: local
        script: voting-stress.js
        output: -

     scenarios: (100.00%) 1 scenario, 600 max VUs, 4m30s max duration (incl. graceful stop):
              * default: Up to 600 looping VUs for 4m0s over 8 stages (gracefulRampDown: 30s, gracefulStop: 30s)


Run       [ 100% ] setup()
default   [   0% ]

Run       [ 100% ] setup()
default   [   0% ]

Run       [ 100% ] setup()
default   [   0% ]

Run       [ 100% ] setup()
default   [   0% ]

Run       [ 100% ] setup()
default   [   0% ]

Run       [ 100% ] setup()
default   [   0% ]

Run       [ 100% ] setup()
default   [   0% ]

Run       [ 100% ] setup()
default   [   0% ]

Run       [ 100% ] setup()
default   [   0% ]

Run       [ 100% ] setup()
default   [   0% ]

Run       [ 100% ] setup()
default   [   0% ]

Run       [ 100% ] setup()
default   [   0% ]

Run       [ 100% ] setup()
default   [   0% ]

running (0m14.0s), 001/600 VUs, 0 complete and 0 interrupted iterations
default   [   0% ] 001/600 VUs  0m00.2s/4m00.0s

running (0m15.0s), 001/600 VUs, 4 complete and 0 interrupted iterations
default   [   0% ] 001/600 VUs  0m01.2s/4m00.0s

running (0m16.0s), 002/600 VUs, 10 complete and 0 interrupted iterations
default   [   1% ] 002/600 VUs  0m02.2s/4m00.0s

running (0m17.0s), 003/600 VUs, 18 complete and 0 interrupted iterations
default   [   1% ] 003/600 VUs  0m03.2s/4m00.0s

running (0m18.0s), 003/600 VUs, 30 complete and 0 interrupted iterations
default   [   2% ] 003/600 VUs  0m04.2s/4m00.0s

running (0m19.0s), 004/600 VUs, 43 complete and 0 interrupted iterations
default   [   2% ] 004/600 VUs  0m05.2s/4m00.0s

running (0m20.0s), 004/600 VUs, 59 complete and 0 interrupted iterations
default   [   3% ] 004/600 VUs  0m06.2s/4m00.0s

running (0m21.0s), 005/600 VUs, 78 complete and 0 interrupted iterations
default   [   3% ] 005/600 VUs  0m07.2s/4m00.0s

running (0m22.0s), 006/600 VUs, 99 complete and 0 interrupted iterations
default   [   3% ] 006/600 VUs  0m08.2s/4m00.0s

running (0m23.0s), 006/600 VUs, 123 complete and 0 interrupted iterations
default   [   4% ] 006/600 VUs  0m09.2s/4m00.0s

running (0m24.0s), 007/600 VUs, 149 complete and 0 interrupted iterations
default   [   4% ] 007/600 VUs  0m10.2s/4m00.0s

running (0m25.0s), 008/600 VUs, 178 complete and 0 interrupted iterations
default   [   5% ] 008/600 VUs  0m11.2s/4m00.0s

running (0m26.0s), 008/600 VUs, 210 complete and 0 interrupted iterations
default   [   5% ] 008/600 VUs  0m12.2s/4m00.0s

running (0m27.0s), 009/600 VUs, 244 complete and 0 interrupted iterations
default   [   5% ] 009/600 VUs  0m13.2s/4m00.0s

running (0m28.0s), 009/600 VUs, 281 complete and 0 interrupted iterations
default   [   6% ] 009/600 VUs  0m14.2s/4m00.0s

running (0m29.0s), 010/600 VUs, 321 complete and 0 interrupted iterations
default   [   6% ] 010/600 VUs  0m15.2s/4m00.0s

running (0m30.0s), 011/600 VUs, 362 complete and 0 interrupted iterations
default   [   7% ] 011/600 VUs  0m16.2s/4m00.0s

running (0m31.0s), 011/600 VUs, 406 complete and 0 interrupted iterations
default   [   7% ] 011/600 VUs  0m17.2s/4m00.0s

running (0m32.0s), 012/600 VUs, 453 complete and 0 interrupted iterations
default   [   8% ] 012/600 VUs  0m18.2s/4m00.0s

running (0m33.0s), 013/600 VUs, 502 complete and 0 interrupted iterations
default   [   8% ] 013/600 VUs  0m19.2s/4m00.0s

running (0m34.0s), 013/600 VUs, 554 complete and 0 interrupted iterations
default   [   8% ] 013/600 VUs  0m20.2s/4m00.0s

running (0m35.0s), 014/600 VUs, 608 complete and 0 interrupted iterations
default   [   9% ] 014/600 VUs  0m21.2s/4m00.0s

running (0m36.0s), 015/600 VUs, 665 complete and 0 interrupted iterations
default   [   9% ] 015/600 VUs  0m22.2s/4m00.0s

running (0m37.0s), 015/600 VUs, 725 complete and 0 interrupted iterations
default   [  10% ] 015/600 VUs  0m23.2s/4m00.0s

running (0m38.0s), 016/600 VUs, 787 complete and 0 interrupted iterations
default   [  10% ] 016/600 VUs  0m24.2s/4m00.0s

running (0m39.0s), 016/600 VUs, 835 complete and 0 interrupted iterations
default   [  10% ] 016/600 VUs  0m25.2s/4m00.0s

running (0m40.0s), 017/600 VUs, 902 complete and 0 interrupted iterations
default   [  11% ] 017/600 VUs  0m26.2s/4m00.0s

running (0m41.0s), 018/600 VUs, 971 complete and 0 interrupted iterations
default   [  11% ] 018/600 VUs  0m27.2s/4m00.0s

running (0m42.0s), 018/600 VUs, 1043 complete and 0 interrupted iterations
default   [  12% ] 018/600 VUs  0m28.2s/4m00.0s

running (0m43.0s), 019/600 VUs, 1118 complete and 0 interrupted iterations
default   [  12% ] 019/600 VUs  0m29.2s/4m00.0s

running (0m44.0s), 020/600 VUs, 1194 complete and 0 interrupted iterations
default   [  13% ] 020/600 VUs  0m30.2s/4m00.0s

running (0m45.0s), 021/600 VUs, 1275 complete and 0 interrupted iterations
default   [  13% ] 021/600 VUs  0m31.2s/4m00.0s

running (0m46.0s), 022/600 VUs, 1359 complete and 0 interrupted iterations
default   [  13% ] 022/600 VUs  0m32.2s/4m00.0s

running (0m47.0s), 023/600 VUs, 1427 complete and 0 interrupted iterations
default   [  14% ] 023/600 VUs  0m33.2s/4m00.0s

running (0m48.0s), 024/600 VUs, 1519 complete and 0 interrupted iterations
default   [  14% ] 024/600 VUs  0m34.2s/4m00.0s

running (0m49.0s), 025/600 VUs, 1615 complete and 0 interrupted iterations
default   [  15% ] 025/600 VUs  0m35.2s/4m00.0s

running (0m50.0s), 026/600 VUs, 1715 complete and 0 interrupted iterations
default   [  15% ] 026/600 VUs  0m36.2s/4m00.0s

running (0m51.0s), 027/600 VUs, 1819 complete and 0 interrupted iterations
default   [  15% ] 027/600 VUs  0m37.2s/4m00.0s

running (0m52.0s), 028/600 VUs, 1928 complete and 0 interrupted iterations
default   [  16% ] 028/600 VUs  0m38.2s/4m00.0s

running (0m53.0s), 029/600 VUs, 2041 complete and 0 interrupted iterations
default   [  16% ] 029/600 VUs  0m39.2s/4m00.0s

running (0m54.0s), 030/600 VUs, 2158 complete and 0 interrupted iterations
default   [  17% ] 030/600 VUs  0m40.2s/4m00.0s

running (0m55.0s), 031/600 VUs, 2279 complete and 0 interrupted iterations
default   [  17% ] 031/600 VUs  0m41.2s/4m00.0s

running (0m56.0s), 032/600 VUs, 2404 complete and 0 interrupted iterations
default   [  18% ] 032/600 VUs  0m42.2s/4m00.0s

running (0m57.0s), 033/600 VUs, 2539 complete and 0 interrupted iterations
default   [  18% ] 033/600 VUs  0m43.2s/4m00.0s

running (0m58.0s), 034/600 VUs, 2680 complete and 0 interrupted iterations
default   [  18% ] 034/600 VUs  0m44.2s/4m00.0s

running (0m59.0s), 035/600 VUs, 2834 complete and 0 interrupted iterations
default   [  19% ] 035/600 VUs  0m45.2s/4m00.0s

running (1m00.0s), 036/600 VUs, 2975 complete and 0 interrupted iterations
default   [  19% ] 036/600 VUs  0m46.2s/4m00.0s

running (1m01.0s), 037/600 VUs, 3120 complete and 0 interrupted iterations
default   [  20% ] 037/600 VUs  0m47.2s/4m00.0s

running (1m02.0s), 038/600 VUs, 3269 complete and 0 interrupted iterations
default   [  20% ] 038/600 VUs  0m48.2s/4m00.0s

running (1m03.0s), 039/600 VUs, 3434 complete and 0 interrupted iterations
default   [  20% ] 039/600 VUs  0m49.2s/4m00.0s

running (1m04.0s), 040/600 VUs, 3581 complete and 0 interrupted iterations
default   [  21% ] 040/600 VUs  0m50.2s/4m00.0s

running (1m05.0s), 041/600 VUs, 3766 complete and 0 interrupted iterations
default   [  21% ] 041/600 VUs  0m51.2s/4m00.0s

running (1m06.0s), 042/600 VUs, 3942 complete and 0 interrupted iterations
default   [  22% ] 042/600 VUs  0m52.2s/4m00.0s

running (1m07.0s), 043/600 VUs, 4111 complete and 0 interrupted iterations
default   [  22% ] 043/600 VUs  0m53.2s/4m00.0s

running (1m08.0s), 044/600 VUs, 4284 complete and 0 interrupted iterations
default   [  23% ] 044/600 VUs  0m54.2s/4m00.0s

running (1m09.0s), 045/600 VUs, 4461 complete and 0 interrupted iterations
default   [  23% ] 045/600 VUs  0m55.2s/4m00.0s

running (1m10.0s), 046/600 VUs, 4656 complete and 0 interrupted iterations
default   [  23% ] 046/600 VUs  0m56.2s/4m00.0s

running (1m11.0s), 047/600 VUs, 4871 complete and 0 interrupted iterations
default   [  24% ] 047/600 VUs  0m57.2s/4m00.0s

running (1m12.0s), 048/600 VUs, 5062 complete and 0 interrupted iterations
default   [  24% ] 048/600 VUs  0m58.2s/4m00.0s

running (1m13.0s), 049/600 VUs, 5273 complete and 0 interrupted iterations
default   [  25% ] 049/600 VUs  0m59.2s/4m00.0s

running (1m14.0s), 050/600 VUs, 5499 complete and 0 interrupted iterations
default   [  25% ] 050/600 VUs  1m00.2s/4m00.0s

running (1m15.0s), 051/600 VUs, 5723 complete and 0 interrupted iterations
default   [  25% ] 051/600 VUs  1m01.2s/4m00.0s

running (1m16.0s), 053/600 VUs, 5961 complete and 0 interrupted iterations
default   [  26% ] 053/600 VUs  1m02.2s/4m00.0s

running (1m17.0s), 055/600 VUs, 6203 complete and 0 interrupted iterations
default   [  26% ] 055/600 VUs  1m03.2s/4m00.0s

running (1m18.0s), 056/600 VUs, 6440 complete and 0 interrupted iterations
default   [  27% ] 056/600 VUs  1m04.2s/4m00.0s

running (1m19.0s), 058/600 VUs, 6696 complete and 0 interrupted iterations
default   [  27% ] 058/600 VUs  1m05.2s/4m00.0s

running (1m20.0s), 060/600 VUs, 6952 complete and 0 interrupted iterations
default   [  28% ] 060/600 VUs  1m06.2s/4m00.0s

running (1m21.0s), 061/600 VUs, 7203 complete and 0 interrupted iterations
default   [  28% ] 061/600 VUs  1m07.2s/4m00.0s

running (1m22.0s), 063/600 VUs, 7489 complete and 0 interrupted iterations
default   [  28% ] 063/600 VUs  1m08.2s/4m00.0s

running (1m23.0s), 065/600 VUs, 7760 complete and 0 interrupted iterations
default   [  29% ] 065/600 VUs  1m09.2s/4m00.0s

running (1m24.0s), 066/600 VUs, 8043 complete and 0 interrupted iterations
default   [  29% ] 066/600 VUs  1m10.2s/4m00.0s

running (1m25.0s), 068/600 VUs, 8342 complete and 0 interrupted iterations
default   [  30% ] 068/600 VUs  1m11.2s/4m00.0s

running (1m26.0s), 070/600 VUs, 8633 complete and 0 interrupted iterations
default   [  30% ] 070/600 VUs  1m12.2s/4m00.0s

running (1m27.0s), 071/600 VUs, 8932 complete and 0 interrupted iterations
default   [  30% ] 071/600 VUs  1m13.2s/4m00.0s

running (1m28.0s), 073/600 VUs, 9260 complete and 0 interrupted iterations
default   [  31% ] 073/600 VUs  1m14.2s/4m00.0s

running (1m29.0s), 075/600 VUs, 9571 complete and 0 interrupted iterations
default   [  31% ] 075/600 VUs  1m15.2s/4m00.0s

running (1m30.0s), 076/600 VUs, 9894 complete and 0 interrupted iterations
default   [  32% ] 076/600 VUs  1m16.2s/4m00.0s

running (1m31.0s), 078/600 VUs, 10242 complete and 0 interrupted iterations
default   [  32% ] 078/600 VUs  1m17.2s/4m00.0s

running (1m32.0s), 080/600 VUs, 10589 complete and 0 interrupted iterations
default   [  33% ] 080/600 VUs  1m18.2s/4m00.0s

running (1m33.0s), 081/600 VUs, 10943 complete and 0 interrupted iterations
default   [  33% ] 081/600 VUs  1m19.2s/4m00.0s

running (1m34.0s), 083/600 VUs, 11288 complete and 0 interrupted iterations
default   [  33% ] 083/600 VUs  1m20.2s/4m00.0s

running (1m35.0s), 085/600 VUs, 11659 complete and 0 interrupted iterations
default   [  34% ] 085/600 VUs  1m21.2s/4m00.0s

running (1m36.0s), 086/600 VUs, 12035 complete and 0 interrupted iterations
default   [  34% ] 086/600 VUs  1m22.2s/4m00.0s

running (1m37.0s), 088/600 VUs, 12412 complete and 0 interrupted iterations
default   [  35% ] 088/600 VUs  1m23.2s/4m00.0s

running (1m38.0s), 090/600 VUs, 12792 complete and 0 interrupted iterations
default   [  35% ] 090/600 VUs  1m24.2s/4m00.0s

running (1m39.0s), 091/600 VUs, 13133 complete and 0 interrupted iterations
default   [  35% ] 091/600 VUs  1m25.2s/4m00.0s

running (1m40.0s), 093/600 VUs, 13531 complete and 0 interrupted iterations
default   [  36% ] 093/600 VUs  1m26.2s/4m00.0s

running (1m41.0s), 095/600 VUs, 13907 complete and 0 interrupted iterations
default   [  36% ] 095/600 VUs  1m27.2s/4m00.0s

running (1m42.0s), 096/600 VUs, 14303 complete and 0 interrupted iterations
default   [  37% ] 096/600 VUs  1m28.2s/4m00.0s

running (1m43.0s), 098/600 VUs, 14730 complete and 0 interrupted iterations
default   [  37% ] 098/600 VUs  1m29.2s/4m00.0s

running (1m44.0s), 100/600 VUs, 15163 complete and 0 interrupted iterations
default   [  38% ] 100/600 VUs  1m30.2s/4m00.0s

running (1m45.0s), 103/600 VUs, 15616 complete and 0 interrupted iterations
default   [  38% ] 103/600 VUs  1m31.2s/4m00.0s

running (1m46.0s), 107/600 VUs, 16052 complete and 0 interrupted iterations
default   [  38% ] 107/600 VUs  1m32.2s/4m00.0s

running (1m47.0s), 110/600 VUs, 16524 complete and 0 interrupted iterations
default   [  39% ] 110/600 VUs  1m33.2s/4m00.0s

running (1m48.0s), 113/600 VUs, 16995 complete and 0 interrupted iterations
default   [  39% ] 113/600 VUs  1m34.2s/4m00.0s

running (1m49.0s), 117/600 VUs, 17496 complete and 0 interrupted iterations
default   [  40% ] 117/600 VUs  1m35.2s/4m00.0s

running (1m50.0s), 120/600 VUs, 18009 complete and 0 interrupted iterations
default   [  40% ] 120/600 VUs  1m36.2s/4m00.0s

running (1m51.0s), 123/600 VUs, 18509 complete and 0 interrupted iterations
default   [  40% ] 123/600 VUs  1m37.2s/4m00.0s

running (1m52.0s), 127/600 VUs, 18974 complete and 0 interrupted iterations
default   [  41% ] 127/600 VUs  1m38.2s/4m00.0s

running (1m53.0s), 130/600 VUs, 19524 complete and 0 interrupted iterations
default   [  41% ] 130/600 VUs  1m39.2s/4m00.0s

running (1m54.0s), 133/600 VUs, 20065 complete and 0 interrupted iterations
default   [  42% ] 133/600 VUs  1m40.2s/4m00.0s

running (1m55.0s), 137/600 VUs, 20632 complete and 0 interrupted iterations
default   [  42% ] 137/600 VUs  1m41.2s/4m00.0s

running (1m56.0s), 140/600 VUs, 21172 complete and 0 interrupted iterations
default   [  43% ] 140/600 VUs  1m42.2s/4m00.0s

running (1m57.0s), 143/600 VUs, 21748 complete and 0 interrupted iterations
default   [  43% ] 143/600 VUs  1m43.2s/4m00.0s

running (1m58.0s), 147/600 VUs, 22251 complete and 0 interrupted iterations
default   [  43% ] 147/600 VUs  1m44.2s/4m00.0s

running (1m59.0s), 150/600 VUs, 22802 complete and 0 interrupted iterations
default   [  44% ] 150/600 VUs  1m45.2s/4m00.0s

running (2m00.0s), 153/600 VUs, 23391 complete and 0 interrupted iterations
default   [  44% ] 153/600 VUs  1m46.2s/4m00.0s

running (2m01.0s), 157/600 VUs, 23987 complete and 0 interrupted iterations
default   [  45% ] 157/600 VUs  1m47.2s/4m00.0s

running (2m02.0s), 160/600 VUs, 24555 complete and 0 interrupted iterations
default   [  45% ] 160/600 VUs  1m48.2s/4m00.0s

running (2m03.0s), 163/600 VUs, 25141 complete and 0 interrupted iterations
default   [  45% ] 163/600 VUs  1m49.2s/4m00.0s

running (2m04.0s), 167/600 VUs, 25730 complete and 0 interrupted iterations
default   [  46% ] 167/600 VUs  1m50.2s/4m00.0s

running (2m05.0s), 170/600 VUs, 26316 complete and 0 interrupted iterations
default   [  46% ] 170/600 VUs  1m51.2s/4m00.0s

running (2m06.0s), 173/600 VUs, 26878 complete and 0 interrupted iterations
default   [  47% ] 173/600 VUs  1m52.2s/4m00.0s

running (2m07.0s), 177/600 VUs, 27460 complete and 0 interrupted iterations
default   [  47% ] 177/600 VUs  1m53.2s/4m00.0s

running (2m08.0s), 180/600 VUs, 28058 complete and 0 interrupted iterations
default   [  48% ] 180/600 VUs  1m54.2s/4m00.0s

running (2m09.0s), 183/600 VUs, 28640 complete and 0 interrupted iterations
default   [  48% ] 183/600 VUs  1m55.2s/4m00.0s

running (2m10.0s), 187/600 VUs, 29215 complete and 0 interrupted iterations
default   [  48% ] 187/600 VUs  1m56.2s/4m00.0s

running (2m11.0s), 190/600 VUs, 29792 complete and 0 interrupted iterations
default   [  49% ] 190/600 VUs  1m57.2s/4m00.0s

running (2m12.0s), 193/600 VUs, 30365 complete and 0 interrupted iterations
default   [  49% ] 193/600 VUs  1m58.2s/4m00.0s

running (2m13.0s), 197/600 VUs, 30948 complete and 0 interrupted iterations
default   [  50% ] 197/600 VUs  1m59.2s/4m00.0s

running (2m14.0s), 200/600 VUs, 31514 complete and 0 interrupted iterations
default   [  50% ] 200/600 VUs  2m00.2s/4m00.0s

running (2m15.0s), 203/600 VUs, 32087 complete and 0 interrupted iterations
default   [  50% ] 203/600 VUs  2m01.2s/4m00.0s

running (2m16.0s), 207/600 VUs, 32647 complete and 0 interrupted iterations
default   [  51% ] 207/600 VUs  2m02.2s/4m00.0s

running (2m17.0s), 210/600 VUs, 33224 complete and 0 interrupted iterations
default   [  51% ] 210/600 VUs  2m03.2s/4m00.0s

running (2m18.0s), 213/600 VUs, 33780 complete and 0 interrupted iterations
default   [  52% ] 213/600 VUs  2m04.2s/4m00.0s

running (2m19.0s), 217/600 VUs, 34347 complete and 0 interrupted iterations
default   [  52% ] 217/600 VUs  2m05.2s/4m00.0s

running (2m20.0s), 220/600 VUs, 34915 complete and 0 interrupted iterations
default   [  53% ] 220/600 VUs  2m06.2s/4m00.0s

running (2m21.0s), 223/600 VUs, 35492 complete and 0 interrupted iterations
default   [  53% ] 223/600 VUs  2m07.2s/4m00.0s

running (2m22.0s), 227/600 VUs, 36064 complete and 0 interrupted iterations
default   [  53% ] 227/600 VUs  2m08.2s/4m00.0s

running (2m23.0s), 230/600 VUs, 36630 complete and 0 interrupted iterations
default   [  54% ] 230/600 VUs  2m09.2s/4m00.0s

running (2m24.0s), 233/600 VUs, 37214 complete and 0 interrupted iterations
default   [  54% ] 233/600 VUs  2m10.2s/4m00.0s

running (2m25.0s), 237/600 VUs, 37810 complete and 0 interrupted iterations
default   [  55% ] 237/600 VUs  2m11.2s/4m00.0s

running (2m26.0s), 240/600 VUs, 38359 complete and 0 interrupted iterations
default   [  55% ] 240/600 VUs  2m12.2s/4m00.0s

running (2m27.0s), 243/600 VUs, 38915 complete and 0 interrupted iterations
default   [  55% ] 243/600 VUs  2m13.2s/4m00.0s

running (2m28.0s), 247/600 VUs, 39501 complete and 0 interrupted iterations
default   [  56% ] 247/600 VUs  2m14.2s/4m00.0s

running (2m29.0s), 250/600 VUs, 40059 complete and 0 interrupted iterations
default   [  56% ] 250/600 VUs  2m15.2s/4m00.0s

running (2m30.0s), 253/600 VUs, 40630 complete and 0 interrupted iterations
default   [  57% ] 253/600 VUs  2m16.2s/4m00.0s

running (2m31.0s), 257/600 VUs, 41200 complete and 0 interrupted iterations
default   [  57% ] 257/600 VUs  2m17.2s/4m00.0s

running (2m32.0s), 260/600 VUs, 41777 complete and 0 interrupted iterations
default   [  58% ] 260/600 VUs  2m18.2s/4m00.0s

running (2m33.0s), 263/600 VUs, 42354 complete and 0 interrupted iterations
default   [  58% ] 263/600 VUs  2m19.2s/4m00.0s

running (2m34.0s), 267/600 VUs, 42924 complete and 0 interrupted iterations
default   [  58% ] 267/600 VUs  2m20.2s/4m00.0s

running (2m35.0s), 270/600 VUs, 43519 complete and 0 interrupted iterations
default   [  59% ] 270/600 VUs  2m21.2s/4m00.0s

running (2m36.0s), 273/600 VUs, 44056 complete and 0 interrupted iterations
default   [  59% ] 273/600 VUs  2m22.2s/4m00.0s

running (2m37.0s), 277/600 VUs, 44631 complete and 0 interrupted iterations
default   [  60% ] 277/600 VUs  2m23.2s/4m00.0s

running (2m38.0s), 280/600 VUs, 45201 complete and 0 interrupted iterations
default   [  60% ] 280/600 VUs  2m24.2s/4m00.0s

running (2m39.0s), 283/600 VUs, 45781 complete and 0 interrupted iterations
default   [  60% ] 283/600 VUs  2m25.2s/4m00.0s

running (2m40.0s), 287/600 VUs, 46371 complete and 0 interrupted iterations
default   [  61% ] 287/600 VUs  2m26.2s/4m00.0s

running (2m41.0s), 290/600 VUs, 46954 complete and 0 interrupted iterations
default   [  61% ] 290/600 VUs  2m27.2s/4m00.0s

running (2m42.0s), 293/600 VUs, 47550 complete and 0 interrupted iterations
default   [  62% ] 293/600 VUs  2m28.2s/4m00.0s

running (2m43.0s), 297/600 VUs, 48125 complete and 0 interrupted iterations
default   [  62% ] 297/600 VUs  2m29.2s/4m00.0s

running (2m44.0s), 300/600 VUs, 48670 complete and 0 interrupted iterations
default   [  63% ] 300/600 VUs  2m30.2s/4m00.0s

running (2m45.0s), 303/600 VUs, 49208 complete and 0 interrupted iterations
default   [  63% ] 303/600 VUs  2m31.2s/4m00.0s

running (2m46.0s), 307/600 VUs, 49713 complete and 0 interrupted iterations
default   [  63% ] 307/600 VUs  2m32.2s/4m00.0s

running (2m47.0s), 310/600 VUs, 50261 complete and 0 interrupted iterations
default   [  64% ] 310/600 VUs  2m33.2s/4m00.0s

running (2m48.0s), 313/600 VUs, 50826 complete and 0 interrupted iterations
default   [  64% ] 313/600 VUs  2m34.2s/4m00.0s

running (2m49.0s), 317/600 VUs, 51399 complete and 0 interrupted iterations
default   [  65% ] 317/600 VUs  2m35.2s/4m00.0s

running (2m50.0s), 320/600 VUs, 51979 complete and 0 interrupted iterations
default   [  65% ] 320/600 VUs  2m36.2s/4m00.0s

running (2m51.0s), 323/600 VUs, 52560 complete and 0 interrupted iterations
default   [  65% ] 323/600 VUs  2m37.2s/4m00.0s

running (2m52.0s), 327/600 VUs, 53127 complete and 0 interrupted iterations
default   [  66% ] 327/600 VUs  2m38.2s/4m00.0s

running (2m53.0s), 330/600 VUs, 53702 complete and 0 interrupted iterations
default   [  66% ] 330/600 VUs  2m39.2s/4m00.0s

running (2m54.0s), 333/600 VUs, 54276 complete and 0 interrupted iterations
default   [  67% ] 333/600 VUs  2m40.2s/4m00.0s

running (2m55.0s), 337/600 VUs, 54854 complete and 0 interrupted iterations
default   [  67% ] 337/600 VUs  2m41.2s/4m00.0s

running (2m56.0s), 340/600 VUs, 55375 complete and 0 interrupted iterations
default   [  68% ] 340/600 VUs  2m42.2s/4m00.0s

running (2m57.0s), 343/600 VUs, 55962 complete and 0 interrupted iterations
default   [  68% ] 343/600 VUs  2m43.2s/4m00.0s

running (2m58.0s), 347/600 VUs, 56529 complete and 0 interrupted iterations
default   [  68% ] 347/600 VUs  2m44.2s/4m00.0s

running (2m59.0s), 350/600 VUs, 57118 complete and 0 interrupted iterations
default   [  69% ] 350/600 VUs  2m45.2s/4m00.0s

running (3m00.0s), 353/600 VUs, 57655 complete and 0 interrupted iterations
default   [  69% ] 353/600 VUs  2m46.2s/4m00.0s

running (3m01.0s), 357/600 VUs, 58218 complete and 0 interrupted iterations
default   [  70% ] 357/600 VUs  2m47.2s/4m00.0s

running (3m02.0s), 360/600 VUs, 58784 complete and 0 interrupted iterations
default   [  70% ] 360/600 VUs  2m48.2s/4m00.0s

running (3m03.0s), 363/600 VUs, 59366 complete and 0 interrupted iterations
default   [  70% ] 363/600 VUs  2m49.2s/4m00.0s

running (3m04.0s), 367/600 VUs, 59943 complete and 0 interrupted iterations
default   [  71% ] 367/600 VUs  2m50.2s/4m00.0s

running (3m05.0s), 370/600 VUs, 60507 complete and 0 interrupted iterations
default   [  71% ] 370/600 VUs  2m51.2s/4m00.0s

running (3m06.0s), 373/600 VUs, 61064 complete and 0 interrupted iterations
default   [  72% ] 373/600 VUs  2m52.2s/4m00.0s

running (3m07.0s), 377/600 VUs, 61651 complete and 0 interrupted iterations
default   [  72% ] 377/600 VUs  2m53.2s/4m00.0s

running (3m08.0s), 380/600 VUs, 62231 complete and 0 interrupted iterations
default   [  73% ] 380/600 VUs  2m54.2s/4m00.0s

running (3m09.0s), 383/600 VUs, 62806 complete and 0 interrupted iterations
default   [  73% ] 383/600 VUs  2m55.2s/4m00.0s

running (3m10.0s), 387/600 VUs, 63382 complete and 0 interrupted iterations
default   [  73% ] 387/600 VUs  2m56.2s/4m00.0s

running (3m11.0s), 390/600 VUs, 63977 complete and 0 interrupted iterations
default   [  74% ] 390/600 VUs  2m57.2s/4m00.0s

running (3m12.0s), 393/600 VUs, 64556 complete and 0 interrupted iterations
default   [  74% ] 393/600 VUs  2m58.2s/4m00.0s

running (3m13.0s), 397/600 VUs, 65145 complete and 0 interrupted iterations
default   [  75% ] 397/600 VUs  2m59.2s/4m00.0s

running (3m14.0s), 401/600 VUs, 65737 complete and 0 interrupted iterations
default   [  75% ] 401/600 VUs  3m00.2s/4m00.0s

running (3m15.0s), 407/600 VUs, 66320 complete and 0 interrupted iterations
default   [  75% ] 407/600 VUs  3m01.2s/4m00.0s

running (3m16.0s), 414/600 VUs, 66851 complete and 0 interrupted iterations
default   [  76% ] 414/600 VUs  3m02.2s/4m00.0s

running (3m17.0s), 421/600 VUs, 67385 complete and 0 interrupted iterations
default   [  76% ] 421/600 VUs  3m03.2s/4m00.0s

running (3m18.0s), 427/600 VUs, 67968 complete and 0 interrupted iterations
default   [  77% ] 427/600 VUs  3m04.2s/4m00.0s

running (3m19.0s), 434/600 VUs, 68566 complete and 0 interrupted iterations
default   [  77% ] 434/600 VUs  3m05.2s/4m00.0s

running (3m20.0s), 441/600 VUs, 69150 complete and 0 interrupted iterations
default   [  78% ] 441/600 VUs  3m06.2s/4m00.0s

running (3m21.0s), 447/600 VUs, 69733 complete and 0 interrupted iterations
default   [  78% ] 447/600 VUs  3m07.2s/4m00.0s

running (3m22.0s), 454/600 VUs, 70306 complete and 0 interrupted iterations
default   [  78% ] 454/600 VUs  3m08.2s/4m00.0s

running (3m23.0s), 461/600 VUs, 70899 complete and 0 interrupted iterations
default   [  79% ] 461/600 VUs  3m09.2s/4m00.0s

running (3m24.0s), 467/600 VUs, 71480 complete and 0 interrupted iterations
default   [  79% ] 467/600 VUs  3m10.2s/4m00.0s

running (3m25.0s), 474/600 VUs, 72041 complete and 0 interrupted iterations
default   [  80% ] 474/600 VUs  3m11.2s/4m00.0s

running (3m26.0s), 481/600 VUs, 72587 complete and 0 interrupted iterations
default   [  80% ] 481/600 VUs  3m12.2s/4m00.0s

running (3m27.0s), 487/600 VUs, 73156 complete and 0 interrupted iterations
default   [  80% ] 487/600 VUs  3m13.2s/4m00.0s

running (3m28.0s), 494/600 VUs, 73721 complete and 0 interrupted iterations
default   [  81% ] 494/600 VUs  3m14.2s/4m00.0s

running (3m29.0s), 501/600 VUs, 74291 complete and 0 interrupted iterations
default   [  81% ] 501/600 VUs  3m15.2s/4m00.0s

running (3m30.0s), 507/600 VUs, 74880 complete and 0 interrupted iterations
default   [  82% ] 507/600 VUs  3m16.2s/4m00.0s

running (3m31.0s), 514/600 VUs, 75451 complete and 0 interrupted iterations
default   [  82% ] 514/600 VUs  3m17.2s/4m00.0s

running (3m32.0s), 521/600 VUs, 76000 complete and 0 interrupted iterations
default   [  83% ] 521/600 VUs  3m18.2s/4m00.0s

running (3m33.0s), 527/600 VUs, 76577 complete and 0 interrupted iterations
default   [  83% ] 527/600 VUs  3m19.2s/4m00.0s

running (3m34.0s), 534/600 VUs, 77160 complete and 0 interrupted iterations
default   [  83% ] 534/600 VUs  3m20.2s/4m00.0s

running (3m35.0s), 541/600 VUs, 77740 complete and 0 interrupted iterations
default   [  84% ] 541/600 VUs  3m21.2s/4m00.0s

running (3m36.0s), 547/600 VUs, 78299 complete and 0 interrupted iterations
default   [  84% ] 547/600 VUs  3m22.2s/4m00.0s

running (3m37.0s), 554/600 VUs, 78856 complete and 0 interrupted iterations
default   [  85% ] 554/600 VUs  3m23.2s/4m00.0s

running (3m38.0s), 561/600 VUs, 79414 complete and 0 interrupted iterations
default   [  85% ] 561/600 VUs  3m24.2s/4m00.0s

running (3m39.0s), 567/600 VUs, 80002 complete and 0 interrupted iterations
default   [  85% ] 567/600 VUs  3m25.2s/4m00.0s

running (3m40.0s), 574/600 VUs, 80592 complete and 0 interrupted iterations
default   [  86% ] 574/600 VUs  3m26.2s/4m00.0s

running (3m41.0s), 581/600 VUs, 81151 complete and 0 interrupted iterations
default   [  86% ] 581/600 VUs  3m27.2s/4m00.0s

running (3m42.0s), 587/600 VUs, 81704 complete and 0 interrupted iterations
default   [  87% ] 587/600 VUs  3m28.2s/4m00.0s

running (3m43.0s), 594/600 VUs, 82290 complete and 0 interrupted iterations
default   [  87% ] 594/600 VUs  3m29.2s/4m00.0s

running (3m44.0s), 600/600 VUs, 82880 complete and 0 interrupted iterations
default   [  88% ] 600/600 VUs  3m30.2s/4m00.0s

running (3m45.0s), 585/600 VUs, 83458 complete and 0 interrupted iterations
default   [  88% ] 585/600 VUs  3m31.2s/4m00.0s

running (3m46.0s), 563/600 VUs, 84026 complete and 0 interrupted iterations
default   [  88% ] 563/600 VUs  3m32.2s/4m00.0s

running (3m47.0s), 545/600 VUs, 84598 complete and 0 interrupted iterations
default   [  89% ] 545/600 VUs  3m33.2s/4m00.0s

running (3m48.0s), 526/600 VUs, 85132 complete and 0 interrupted iterations
default   [  89% ] 526/600 VUs  3m34.2s/4m00.0s

running (3m49.0s), 507/600 VUs, 85696 complete and 0 interrupted iterations
default   [  90% ] 507/600 VUs  3m35.2s/4m00.0s

running (3m50.0s), 488/600 VUs, 86254 complete and 0 interrupted iterations
default   [  90% ] 488/600 VUs  3m36.2s/4m00.0s

running (3m51.0s), 466/600 VUs, 86821 complete and 0 interrupted iterations
default   [  90% ] 466/600 VUs  3m37.2s/4m00.0s

running (3m52.0s), 446/600 VUs, 87380 complete and 0 interrupted iterations
default   [  91% ] 446/600 VUs  3m38.2s/4m00.0s

running (3m53.0s), 420/600 VUs, 87983 complete and 0 interrupted iterations
default   [  91% ] 420/600 VUs  3m39.2s/4m00.0s

running (3m54.0s), 404/600 VUs, 88589 complete and 0 interrupted iterations
default   [  92% ] 404/600 VUs  3m40.2s/4m00.0s

running (3m55.0s), 384/600 VUs, 89168 complete and 0 interrupted iterations
default   [  92% ] 384/600 VUs  3m41.2s/4m00.0s

running (3m56.0s), 364/600 VUs, 89730 complete and 0 interrupted iterations
default   [  93% ] 364/600 VUs  3m42.2s/4m00.0s

running (3m57.0s), 342/600 VUs, 90318 complete and 0 interrupted iterations
default   [  93% ] 342/600 VUs  3m43.2s/4m00.0s

running (3m58.0s), 326/600 VUs, 90899 complete and 0 interrupted iterations
default   [  93% ] 326/600 VUs  3m44.2s/4m00.0s

running (3m59.0s), 301/600 VUs, 91478 complete and 0 interrupted iterations
default   [  94% ] 301/600 VUs  3m45.2s/4m00.0s

running (4m00.0s), 283/600 VUs, 92061 complete and 0 interrupted iterations
default   [  94% ] 283/600 VUs  3m46.2s/4m00.0s

running (4m01.0s), 261/600 VUs, 92640 complete and 0 interrupted iterations
default   [  95% ] 261/600 VUs  3m47.2s/4m00.0s

running (4m02.0s), 241/600 VUs, 93192 complete and 0 interrupted iterations
default   [  95% ] 241/600 VUs  3m48.2s/4m00.0s

running (4m03.0s), 222/600 VUs, 93756 complete and 0 interrupted iterations
default   [  95% ] 222/600 VUs  3m49.2s/4m00.0s

running (4m04.0s), 201/600 VUs, 94313 complete and 0 interrupted iterations
default   [  96% ] 201/600 VUs  3m50.2s/4m00.0s

running (4m05.0s), 180/600 VUs, 94881 complete and 0 interrupted iterations
default   [  96% ] 180/600 VUs  3m51.2s/4m00.0s

running (4m06.0s), 159/600 VUs, 95460 complete and 0 interrupted iterations
default   [  97% ] 159/600 VUs  3m52.2s/4m00.0s

running (4m07.0s), 142/600 VUs, 95999 complete and 0 interrupted iterations
default   [  97% ] 142/600 VUs  3m53.2s/4m00.0s

running (4m08.0s), 119/600 VUs, 96556 complete and 0 interrupted iterations
default   [  98% ] 119/600 VUs  3m54.2s/4m00.0s

running (4m09.0s), 098/600 VUs, 97032 complete and 0 interrupted iterations
default   [  98% ] 098/600 VUs  3m55.2s/4m00.0s

running (4m10.0s), 080/600 VUs, 97435 complete and 0 interrupted iterations
default   [  98% ] 080/600 VUs  3m56.2s/4m00.0s

running (4m11.0s), 059/600 VUs, 97757 complete and 0 interrupted iterations
default   [  99% ] 059/600 VUs  3m57.2s/4m00.0s

running (4m12.0s), 039/600 VUs, 97990 complete and 0 interrupted iterations
default   [  99% ] 039/600 VUs  3m58.2s/4m00.0s

running (4m13.0s), 019/600 VUs, 98133 complete and 0 interrupted iterations
default   [ 100% ] 019/600 VUs  3m59.2s/4m00.0s

running (4m13.9s), 000/600 VUs, 98183 complete and 0 interrupted iterations
default ✓ [ 100% ] 000/600 VUs  4m0s


  █ THRESHOLDS 

    http_req_duration
    ✓ 'p(95)<5000' p(95)=399.99ms

    http_req_failed
    ✓ 'rate<0.1' rate=0.00%


  █ TOTAL RESULTS 

    checks_total.......: 196366  773.324415/s
    checks_succeeded...: 100.00% 196366 out of 196366
    checks_failed......: 0.00%   0 out of 196366

    ✓ GET /votings/{id} 200
    ✓ POST /vote 200

    HTTP
    http_req_duration..............: avg=154.51ms min=3.1ms    med=125.8ms max=998.32ms p(90)=353.69ms p(95)=399.99ms
      { expected_response:true }...: avg=154.51ms min=3.1ms    med=125.8ms max=998.32ms p(90)=353.69ms p(95)=399.99ms
    http_req_failed................: 0.00%  0 out of 197598
    http_reqs......................: 197598 778.176251/s

    EXECUTION
    iteration_duration.............: avg=511.15ms min=208.74ms med=464.1ms max=1.73s    p(90)=893.99ms p(95)=1s      
    iterations.....................: 98183  386.662208/s
    vus............................: 19     min=0           max=600
    vus_max........................: 600    min=600         max=600

    NETWORK
    data_received..................: 257 MB 1.0 MB/s
    data_sent......................: 88 MB  345 kB/s




running (4m13.9s), 000/600 VUs, 98183 complete and 0 interrupted iterations
default ✓ [ 100% ] 000/600 VUs  4m0s
