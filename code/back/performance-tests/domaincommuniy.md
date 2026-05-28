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