
================================================================
% cd DomainFeed/feed && k6 run feed-load.js
================================================================


         /\      Grafana   /‾‾/  
    /\  /  \     |\  __   /  /   
   /  \/    \    | |/ /  /   ‾‾\ 
  /          \   |   (  |  (‾)  |
 / __________ \  |_|\_\  \_____/ 


     execution: local
        script: feed-load.js
        output: -

     scenarios: (100.00%) 2 scenarios, 210 max VUs, 2m30s max duration (incl. graceful stop):
              * countQuery: 52 looping VUs for 2m0s (exec: queryCount, gracefulStop: 30s)
              * feedQuery: 158 looping VUs for 2m0s (exec: queryFeed, gracefulStop: 30s)


Run          [ 100% ] setup()
countQuery   [   0% ]
feedQuery    [   0% ]

Run          [ 100% ] setup()
countQuery   [   0% ]
feedQuery    [   0% ]

Run          [ 100% ] setup()
countQuery   [   0% ]
feedQuery    [   0% ]

Run          [ 100% ] setup()
countQuery   [   0% ]
feedQuery    [   0% ]

Run          [ 100% ] setup()
countQuery   [   0% ]
feedQuery    [   0% ]

Run          [ 100% ] setup()
countQuery   [   0% ]
feedQuery    [   0% ]

Run          [ 100% ] setup()
countQuery   [   0% ]
feedQuery    [   0% ]

Run          [ 100% ] setup()
countQuery   [   0% ]
feedQuery    [   0% ]

Run          [ 100% ] setup()
countQuery   [   0% ]
feedQuery    [   0% ]

Run          [ 100% ] setup()
countQuery   [   0% ]
feedQuery    [   0% ]

Run          [ 100% ] setup()
countQuery   [   0% ]
feedQuery    [   0% ]
time="2026-05-28T17:42:18-03:00" level=info msg="Setup concluído: 230 usuários prontos." source=console

running (0m12.0s), 210/210 VUs, 11 complete and 0 interrupted iterations
countQuery   [   0% ] 52 VUs   0m00.6s/2m0s
feedQuery    [   0% ] 158 VUs  0m00.6s/2m0s

running (0m13.0s), 210/210 VUs, 262 complete and 0 interrupted iterations
countQuery   [   1% ] 52 VUs   0m01.6s/2m0s
feedQuery    [   1% ] 158 VUs  0m01.6s/2m0s

running (0m14.0s), 210/210 VUs, 524 complete and 0 interrupted iterations
countQuery   [   2% ] 52 VUs   0m02.6s/2m0s
feedQuery    [   2% ] 158 VUs  0m02.6s/2m0s

running (0m15.0s), 210/210 VUs, 786 complete and 0 interrupted iterations
countQuery   [   3% ] 52 VUs   0m03.6s/2m0s
feedQuery    [   3% ] 158 VUs  0m03.6s/2m0s

running (0m16.0s), 210/210 VUs, 1048 complete and 0 interrupted iterations
countQuery   [   4% ] 52 VUs   0m04.6s/2m0s
feedQuery    [   4% ] 158 VUs  0m04.6s/2m0s

running (0m17.0s), 210/210 VUs, 1310 complete and 0 interrupted iterations
countQuery   [   5% ] 52 VUs   0m05.6s/2m0s
feedQuery    [   5% ] 158 VUs  0m05.6s/2m0s

running (0m18.0s), 210/210 VUs, 1572 complete and 0 interrupted iterations
countQuery   [   5% ] 52 VUs   0m06.6s/2m0s
feedQuery    [   5% ] 158 VUs  0m06.6s/2m0s

running (0m19.0s), 210/210 VUs, 1834 complete and 0 interrupted iterations
countQuery   [   6% ] 52 VUs   0m07.6s/2m0s
feedQuery    [   6% ] 158 VUs  0m07.6s/2m0s

running (0m20.0s), 210/210 VUs, 2096 complete and 0 interrupted iterations
countQuery   [   7% ] 52 VUs   0m08.6s/2m0s
feedQuery    [   7% ] 158 VUs  0m08.6s/2m0s

running (0m21.0s), 210/210 VUs, 2339 complete and 0 interrupted iterations
countQuery   [   8% ] 52 VUs   0m09.6s/2m0s
feedQuery    [   8% ] 158 VUs  0m09.6s/2m0s

running (0m22.0s), 210/210 VUs, 2575 complete and 0 interrupted iterations
countQuery   [   9% ] 52 VUs   0m10.6s/2m0s
feedQuery    [   9% ] 158 VUs  0m10.6s/2m0s

running (0m23.0s), 210/210 VUs, 2779 complete and 0 interrupted iterations
countQuery   [  10% ] 52 VUs   0m11.6s/2m0s
feedQuery    [  10% ] 158 VUs  0m11.6s/2m0s

running (0m24.0s), 210/210 VUs, 2992 complete and 0 interrupted iterations
countQuery   [  10% ] 52 VUs   0m12.6s/2m0s
feedQuery    [  10% ] 158 VUs  0m12.6s/2m0s

running (0m25.0s), 210/210 VUs, 3201 complete and 0 interrupted iterations
countQuery   [  11% ] 52 VUs   0m13.6s/2m0s
feedQuery    [  11% ] 158 VUs  0m13.6s/2m0s

running (0m26.0s), 210/210 VUs, 3458 complete and 0 interrupted iterations
countQuery   [  12% ] 52 VUs   0m14.6s/2m0s
feedQuery    [  12% ] 158 VUs  0m14.6s/2m0s

running (0m27.0s), 210/210 VUs, 3720 complete and 0 interrupted iterations
countQuery   [  13% ] 52 VUs   0m15.6s/2m0s
feedQuery    [  13% ] 158 VUs  0m15.6s/2m0s

running (0m28.0s), 210/210 VUs, 3982 complete and 0 interrupted iterations
countQuery   [  14% ] 52 VUs   0m16.6s/2m0s
feedQuery    [  14% ] 158 VUs  0m16.6s/2m0s

running (0m29.0s), 210/210 VUs, 4244 complete and 0 interrupted iterations
countQuery   [  15% ] 52 VUs   0m17.6s/2m0s
feedQuery    [  15% ] 158 VUs  0m17.6s/2m0s

running (0m30.0s), 210/210 VUs, 4506 complete and 0 interrupted iterations
countQuery   [  15% ] 52 VUs   0m18.6s/2m0s
feedQuery    [  15% ] 158 VUs  0m18.6s/2m0s

running (0m31.0s), 210/210 VUs, 4768 complete and 0 interrupted iterations
countQuery   [  16% ] 52 VUs   0m19.6s/2m0s
feedQuery    [  16% ] 158 VUs  0m19.6s/2m0s

running (0m32.0s), 210/210 VUs, 5030 complete and 0 interrupted iterations
countQuery   [  17% ] 52 VUs   0m20.6s/2m0s
feedQuery    [  17% ] 158 VUs  0m20.6s/2m0s

running (0m33.0s), 210/210 VUs, 5292 complete and 0 interrupted iterations
countQuery   [  18% ] 52 VUs   0m21.6s/2m0s
feedQuery    [  18% ] 158 VUs  0m21.6s/2m0s

running (0m34.0s), 210/210 VUs, 5549 complete and 0 interrupted iterations
countQuery   [  19% ] 52 VUs   0m22.6s/2m0s
feedQuery    [  19% ] 158 VUs  0m22.6s/2m0s

running (0m35.0s), 210/210 VUs, 5772 complete and 0 interrupted iterations
countQuery   [  20% ] 52 VUs   0m23.6s/2m0s
feedQuery    [  20% ] 158 VUs  0m23.6s/2m0s

running (0m36.0s), 210/210 VUs, 6026 complete and 0 interrupted iterations
countQuery   [  20% ] 52 VUs   0m24.6s/2m0s
feedQuery    [  20% ] 158 VUs  0m24.6s/2m0s

running (0m37.0s), 210/210 VUs, 6288 complete and 0 interrupted iterations
countQuery   [  21% ] 52 VUs   0m25.6s/2m0s
feedQuery    [  21% ] 158 VUs  0m25.6s/2m0s

running (0m38.0s), 210/210 VUs, 6550 complete and 0 interrupted iterations
countQuery   [  22% ] 52 VUs   0m26.6s/2m0s
feedQuery    [  22% ] 158 VUs  0m26.6s/2m0s

running (0m39.0s), 210/210 VUs, 6812 complete and 0 interrupted iterations
countQuery   [  23% ] 52 VUs   0m27.6s/2m0s
feedQuery    [  23% ] 158 VUs  0m27.6s/2m0s

running (0m40.0s), 210/210 VUs, 7074 complete and 0 interrupted iterations
countQuery   [  24% ] 52 VUs   0m28.6s/2m0s
feedQuery    [  24% ] 158 VUs  0m28.6s/2m0s

running (0m41.0s), 210/210 VUs, 7336 complete and 0 interrupted iterations
countQuery   [  25% ] 52 VUs   0m29.6s/2m0s
feedQuery    [  25% ] 158 VUs  0m29.6s/2m0s

running (0m42.0s), 210/210 VUs, 7598 complete and 0 interrupted iterations
countQuery   [  25% ] 52 VUs   0m30.6s/2m0s
feedQuery    [  25% ] 158 VUs  0m30.6s/2m0s

running (0m43.0s), 210/210 VUs, 7860 complete and 0 interrupted iterations
countQuery   [  26% ] 52 VUs   0m31.6s/2m0s
feedQuery    [  26% ] 158 VUs  0m31.6s/2m0s

running (0m44.0s), 210/210 VUs, 8122 complete and 0 interrupted iterations
countQuery   [  27% ] 52 VUs   0m32.6s/2m0s
feedQuery    [  27% ] 158 VUs  0m32.6s/2m0s

running (0m45.0s), 210/210 VUs, 8384 complete and 0 interrupted iterations
countQuery   [  28% ] 52 VUs   0m33.6s/2m0s
feedQuery    [  28% ] 158 VUs  0m33.6s/2m0s

running (0m46.0s), 210/210 VUs, 8571 complete and 0 interrupted iterations
countQuery   [  29% ] 52 VUs   0m34.6s/2m0s
feedQuery    [  29% ] 158 VUs  0m34.6s/2m0s

running (0m47.0s), 210/210 VUs, 8816 complete and 0 interrupted iterations
countQuery   [  30% ] 52 VUs   0m35.6s/2m0s
feedQuery    [  30% ] 158 VUs  0m35.6s/2m0s

running (0m48.0s), 210/210 VUs, 9025 complete and 0 interrupted iterations
countQuery   [  30% ] 52 VUs   0m36.6s/2m0s
feedQuery    [  30% ] 158 VUs  0m36.6s/2m0s

running (0m49.0s), 210/210 VUs, 9242 complete and 0 interrupted iterations
countQuery   [  31% ] 52 VUs   0m37.6s/2m0s
feedQuery    [  31% ] 158 VUs  0m37.6s/2m0s

running (0m50.0s), 210/210 VUs, 9484 complete and 0 interrupted iterations
countQuery   [  32% ] 52 VUs   0m38.6s/2m0s
feedQuery    [  32% ] 158 VUs  0m38.6s/2m0s

running (0m51.0s), 210/210 VUs, 9746 complete and 0 interrupted iterations
countQuery   [  33% ] 52 VUs   0m39.6s/2m0s
feedQuery    [  33% ] 158 VUs  0m39.6s/2m0s

running (0m52.0s), 210/210 VUs, 10008 complete and 0 interrupted iterations
countQuery   [  34% ] 52 VUs   0m40.6s/2m0s
feedQuery    [  34% ] 158 VUs  0m40.6s/2m0s

running (0m53.0s), 210/210 VUs, 10270 complete and 0 interrupted iterations
countQuery   [  35% ] 52 VUs   0m41.6s/2m0s
feedQuery    [  35% ] 158 VUs  0m41.6s/2m0s

running (0m54.0s), 210/210 VUs, 10532 complete and 0 interrupted iterations
countQuery   [  35% ] 52 VUs   0m42.6s/2m0s
feedQuery    [  35% ] 158 VUs  0m42.6s/2m0s

running (0m55.0s), 210/210 VUs, 10794 complete and 0 interrupted iterations
countQuery   [  36% ] 52 VUs   0m43.6s/2m0s
feedQuery    [  36% ] 158 VUs  0m43.6s/2m0s

running (0m56.0s), 210/210 VUs, 11039 complete and 0 interrupted iterations
countQuery   [  37% ] 52 VUs   0m44.6s/2m0s
feedQuery    [  37% ] 158 VUs  0m44.6s/2m0s

running (0m57.0s), 210/210 VUs, 11266 complete and 0 interrupted iterations
countQuery   [  38% ] 52 VUs   0m45.6s/2m0s
feedQuery    [  38% ] 158 VUs  0m45.6s/2m0s

running (0m58.0s), 210/210 VUs, 11528 complete and 0 interrupted iterations
countQuery   [  39% ] 52 VUs   0m46.6s/2m0s
feedQuery    [  39% ] 158 VUs  0m46.6s/2m0s

running (0m59.0s), 210/210 VUs, 11790 complete and 0 interrupted iterations
countQuery   [  40% ] 52 VUs   0m47.6s/2m0s
feedQuery    [  40% ] 158 VUs  0m47.6s/2m0s

running (1m00.0s), 210/210 VUs, 12052 complete and 0 interrupted iterations
countQuery   [  40% ] 52 VUs   0m48.6s/2m0s
feedQuery    [  40% ] 158 VUs  0m48.6s/2m0s

running (1m01.0s), 210/210 VUs, 12314 complete and 0 interrupted iterations
countQuery   [  41% ] 52 VUs   0m49.6s/2m0s
feedQuery    [  41% ] 158 VUs  0m49.6s/2m0s

running (1m02.0s), 210/210 VUs, 12576 complete and 0 interrupted iterations
countQuery   [  42% ] 52 VUs   0m50.6s/2m0s
feedQuery    [  42% ] 158 VUs  0m50.6s/2m0s

running (1m03.0s), 210/210 VUs, 12838 complete and 0 interrupted iterations
countQuery   [  43% ] 52 VUs   0m51.6s/2m0s
feedQuery    [  43% ] 158 VUs  0m51.6s/2m0s

running (1m04.0s), 210/210 VUs, 13100 complete and 0 interrupted iterations
countQuery   [  44% ] 52 VUs   0m52.6s/2m0s
feedQuery    [  44% ] 158 VUs  0m52.6s/2m0s

running (1m05.0s), 210/210 VUs, 13362 complete and 0 interrupted iterations
countQuery   [  45% ] 52 VUs   0m53.6s/2m0s
feedQuery    [  45% ] 158 VUs  0m53.6s/2m0s

running (1m06.0s), 210/210 VUs, 13624 complete and 0 interrupted iterations
countQuery   [  45% ] 52 VUs   0m54.6s/2m0s
feedQuery    [  45% ] 158 VUs  0m54.6s/2m0s

running (1m07.0s), 210/210 VUs, 13886 complete and 0 interrupted iterations
countQuery   [  46% ] 52 VUs   0m55.6s/2m0s
feedQuery    [  46% ] 158 VUs  0m55.6s/2m0s

running (1m08.0s), 210/210 VUs, 14148 complete and 0 interrupted iterations
countQuery   [  47% ] 52 VUs   0m56.6s/2m0s
feedQuery    [  47% ] 158 VUs  0m56.6s/2m0s

running (1m09.0s), 210/210 VUs, 14358 complete and 0 interrupted iterations
countQuery   [  48% ] 52 VUs   0m57.6s/2m0s
feedQuery    [  48% ] 158 VUs  0m57.6s/2m0s

running (1m10.0s), 210/210 VUs, 14620 complete and 0 interrupted iterations
countQuery   [  49% ] 52 VUs   0m58.6s/2m0s
feedQuery    [  49% ] 158 VUs  0m58.6s/2m0s

running (1m11.0s), 210/210 VUs, 14827 complete and 0 interrupted iterations
countQuery   [  50% ] 52 VUs   0m59.6s/2m0s
feedQuery    [  50% ] 158 VUs  0m59.6s/2m0s

running (1m12.0s), 210/210 VUs, 15066 complete and 0 interrupted iterations
countQuery   [  50% ] 52 VUs   1m00.6s/2m0s
feedQuery    [  50% ] 158 VUs  1m00.6s/2m0s

running (1m13.0s), 210/210 VUs, 15281 complete and 0 interrupted iterations
countQuery   [  51% ] 52 VUs   1m01.6s/2m0s
feedQuery    [  51% ] 158 VUs  1m01.6s/2m0s

running (1m14.0s), 210/210 VUs, 15510 complete and 0 interrupted iterations
countQuery   [  52% ] 52 VUs   1m02.6s/2m0s
feedQuery    [  52% ] 158 VUs  1m02.6s/2m0s

running (1m15.0s), 210/210 VUs, 15772 complete and 0 interrupted iterations
countQuery   [  53% ] 52 VUs   1m03.6s/2m0s
feedQuery    [  53% ] 158 VUs  1m03.6s/2m0s

running (1m16.0s), 210/210 VUs, 16034 complete and 0 interrupted iterations
countQuery   [  54% ] 52 VUs   1m04.6s/2m0s
feedQuery    [  54% ] 158 VUs  1m04.6s/2m0s

running (1m17.0s), 210/210 VUs, 16296 complete and 0 interrupted iterations
countQuery   [  55% ] 52 VUs   1m05.6s/2m0s
feedQuery    [  55% ] 158 VUs  1m05.6s/2m0s

running (1m18.0s), 210/210 VUs, 16558 complete and 0 interrupted iterations
countQuery   [  55% ] 52 VUs   1m06.6s/2m0s
feedQuery    [  55% ] 158 VUs  1m06.6s/2m0s

running (1m19.0s), 210/210 VUs, 16795 complete and 0 interrupted iterations
countQuery   [  56% ] 52 VUs   1m07.6s/2m0s
feedQuery    [  56% ] 158 VUs  1m07.6s/2m0s

running (1m20.0s), 210/210 VUs, 17030 complete and 0 interrupted iterations
countQuery   [  57% ] 52 VUs   1m08.6s/2m0s
feedQuery    [  57% ] 158 VUs  1m08.6s/2m0s

running (1m21.0s), 210/210 VUs, 17292 complete and 0 interrupted iterations
countQuery   [  58% ] 52 VUs   1m09.6s/2m0s
feedQuery    [  58% ] 158 VUs  1m09.6s/2m0s

running (1m22.0s), 210/210 VUs, 17554 complete and 0 interrupted iterations
countQuery   [  59% ] 52 VUs   1m10.6s/2m0s
feedQuery    [  59% ] 158 VUs  1m10.6s/2m0s

running (1m23.0s), 210/210 VUs, 17816 complete and 0 interrupted iterations
countQuery   [  60% ] 52 VUs   1m11.6s/2m0s
feedQuery    [  60% ] 158 VUs  1m11.6s/2m0s

running (1m24.0s), 210/210 VUs, 18078 complete and 0 interrupted iterations
countQuery   [  60% ] 52 VUs   1m12.6s/2m0s
feedQuery    [  60% ] 158 VUs  1m12.6s/2m0s

running (1m25.0s), 210/210 VUs, 18340 complete and 0 interrupted iterations
countQuery   [  61% ] 52 VUs   1m13.6s/2m0s
feedQuery    [  61% ] 158 VUs  1m13.6s/2m0s

running (1m26.0s), 210/210 VUs, 18602 complete and 0 interrupted iterations
countQuery   [  62% ] 52 VUs   1m14.6s/2m0s
feedQuery    [  62% ] 158 VUs  1m14.6s/2m0s

running (1m27.0s), 210/210 VUs, 18864 complete and 0 interrupted iterations
countQuery   [  63% ] 52 VUs   1m15.6s/2m0s
feedQuery    [  63% ] 158 VUs  1m15.6s/2m0s

running (1m28.0s), 210/210 VUs, 19126 complete and 0 interrupted iterations
countQuery   [  64% ] 52 VUs   1m16.6s/2m0s
feedQuery    [  64% ] 158 VUs  1m16.6s/2m0s

running (1m29.0s), 210/210 VUs, 19388 complete and 0 interrupted iterations
countQuery   [  65% ] 52 VUs   1m17.6s/2m0s
feedQuery    [  65% ] 158 VUs  1m17.6s/2m0s

running (1m30.0s), 210/210 VUs, 19650 complete and 0 interrupted iterations
countQuery   [  65% ] 52 VUs   1m18.6s/2m0s
feedQuery    [  65% ] 158 VUs  1m18.6s/2m0s

running (1m31.0s), 210/210 VUs, 19890 complete and 0 interrupted iterations
countQuery   [  66% ] 52 VUs   1m19.6s/2m0s
feedQuery    [  66% ] 158 VUs  1m19.6s/2m0s

running (1m32.0s), 210/210 VUs, 20122 complete and 0 interrupted iterations
countQuery   [  67% ] 52 VUs   1m20.6s/2m0s
feedQuery    [  67% ] 158 VUs  1m20.6s/2m0s

running (1m33.0s), 210/210 VUs, 20384 complete and 0 interrupted iterations
countQuery   [  68% ] 52 VUs   1m21.6s/2m0s
feedQuery    [  68% ] 158 VUs  1m21.6s/2m0s

running (1m34.0s), 210/210 VUs, 20646 complete and 0 interrupted iterations
countQuery   [  69% ] 52 VUs   1m22.6s/2m0s
feedQuery    [  69% ] 158 VUs  1m22.6s/2m0s

running (1m35.0s), 210/210 VUs, 20885 complete and 0 interrupted iterations
countQuery   [  70% ] 52 VUs   1m23.6s/2m0s
feedQuery    [  70% ] 158 VUs  1m23.6s/2m0s

running (1m36.0s), 210/210 VUs, 21122 complete and 0 interrupted iterations
countQuery   [  70% ] 52 VUs   1m24.6s/2m0s
feedQuery    [  70% ] 158 VUs  1m24.6s/2m0s

running (1m37.0s), 210/210 VUs, 21328 complete and 0 interrupted iterations
countQuery   [  71% ] 52 VUs   1m25.6s/2m0s
feedQuery    [  71% ] 158 VUs  1m25.6s/2m0s

running (1m38.0s), 210/210 VUs, 21556 complete and 0 interrupted iterations
countQuery   [  72% ] 52 VUs   1m26.6s/2m0s
feedQuery    [  72% ] 158 VUs  1m26.6s/2m0s

running (1m39.0s), 210/210 VUs, 21798 complete and 0 interrupted iterations
countQuery   [  73% ] 52 VUs   1m27.6s/2m0s
feedQuery    [  73% ] 158 VUs  1m27.6s/2m0s

running (1m40.0s), 210/210 VUs, 22060 complete and 0 interrupted iterations
countQuery   [  74% ] 52 VUs   1m28.6s/2m0s
feedQuery    [  74% ] 158 VUs  1m28.6s/2m0s

running (1m41.0s), 210/210 VUs, 22270 complete and 0 interrupted iterations
countQuery   [  75% ] 52 VUs   1m29.6s/2m0s
feedQuery    [  75% ] 158 VUs  1m29.6s/2m0s

running (1m42.0s), 210/210 VUs, 22532 complete and 0 interrupted iterations
countQuery   [  75% ] 52 VUs   1m30.6s/2m0s
feedQuery    [  75% ] 158 VUs  1m30.6s/2m0s

running (1m43.0s), 210/210 VUs, 22794 complete and 0 interrupted iterations
countQuery   [  76% ] 52 VUs   1m31.6s/2m0s
feedQuery    [  76% ] 158 VUs  1m31.6s/2m0s

running (1m44.0s), 210/210 VUs, 23056 complete and 0 interrupted iterations
countQuery   [  77% ] 52 VUs   1m32.6s/2m0s
feedQuery    [  77% ] 158 VUs  1m32.6s/2m0s

running (1m45.0s), 210/210 VUs, 23318 complete and 0 interrupted iterations
countQuery   [  78% ] 52 VUs   1m33.6s/2m0s
feedQuery    [  78% ] 158 VUs  1m33.6s/2m0s

running (1m46.0s), 210/210 VUs, 23580 complete and 0 interrupted iterations
countQuery   [  79% ] 52 VUs   1m34.6s/2m0s
feedQuery    [  79% ] 158 VUs  1m34.6s/2m0s

running (1m47.0s), 210/210 VUs, 23842 complete and 0 interrupted iterations
countQuery   [  80% ] 52 VUs   1m35.6s/2m0s
feedQuery    [  80% ] 158 VUs  1m35.6s/2m0s

running (1m48.0s), 210/210 VUs, 24104 complete and 0 interrupted iterations
countQuery   [  80% ] 52 VUs   1m36.6s/2m0s
feedQuery    [  80% ] 158 VUs  1m36.6s/2m0s

running (1m49.0s), 210/210 VUs, 24366 complete and 0 interrupted iterations
countQuery   [  81% ] 52 VUs   1m37.6s/2m0s
feedQuery    [  81% ] 158 VUs  1m37.6s/2m0s

running (1m50.0s), 210/210 VUs, 24611 complete and 0 interrupted iterations
countQuery   [  82% ] 52 VUs   1m38.6s/2m0s
feedQuery    [  82% ] 158 VUs  1m38.6s/2m0s

running (1m51.0s), 210/210 VUs, 24838 complete and 0 interrupted iterations
countQuery   [  83% ] 52 VUs   1m39.6s/2m0s
feedQuery    [  83% ] 158 VUs  1m39.6s/2m0s

running (1m52.0s), 210/210 VUs, 25100 complete and 0 interrupted iterations
countQuery   [  84% ] 52 VUs   1m40.6s/2m0s
feedQuery    [  84% ] 158 VUs  1m40.6s/2m0s

running (1m53.0s), 210/210 VUs, 25362 complete and 0 interrupted iterations
countQuery   [  85% ] 52 VUs   1m41.6s/2m0s
feedQuery    [  85% ] 158 VUs  1m41.6s/2m0s

running (1m54.0s), 210/210 VUs, 25624 complete and 0 interrupted iterations
countQuery   [  85% ] 52 VUs   1m42.6s/2m0s
feedQuery    [  85% ] 158 VUs  1m42.6s/2m0s

running (1m55.0s), 210/210 VUs, 25886 complete and 0 interrupted iterations
countQuery   [  86% ] 52 VUs   1m43.6s/2m0s
feedQuery    [  86% ] 158 VUs  1m43.6s/2m0s

running (1m56.0s), 210/210 VUs, 26148 complete and 0 interrupted iterations
countQuery   [  87% ] 52 VUs   1m44.6s/2m0s
feedQuery    [  87% ] 158 VUs  1m44.6s/2m0s

running (1m57.0s), 210/210 VUs, 26410 complete and 0 interrupted iterations
countQuery   [  88% ] 52 VUs   1m45.6s/2m0s
feedQuery    [  88% ] 158 VUs  1m45.6s/2m0s

running (1m58.0s), 210/210 VUs, 26672 complete and 0 interrupted iterations
countQuery   [  89% ] 52 VUs   1m46.6s/2m0s
feedQuery    [  89% ] 158 VUs  1m46.6s/2m0s

running (1m59.0s), 210/210 VUs, 26934 complete and 0 interrupted iterations
countQuery   [  90% ] 52 VUs   1m47.6s/2m0s
feedQuery    [  90% ] 158 VUs  1m47.6s/2m0s

running (2m00.0s), 210/210 VUs, 27185 complete and 0 interrupted iterations
countQuery   [  90% ] 52 VUs   1m48.6s/2m0s
feedQuery    [  90% ] 158 VUs  1m48.6s/2m0s

running (2m01.0s), 210/210 VUs, 27393 complete and 0 interrupted iterations
countQuery   [  91% ] 52 VUs   1m49.6s/2m0s
feedQuery    [  91% ] 158 VUs  1m49.6s/2m0s

running (2m02.0s), 210/210 VUs, 27599 complete and 0 interrupted iterations
countQuery   [  92% ] 52 VUs   1m50.6s/2m0s
feedQuery    [  92% ] 158 VUs  1m50.6s/2m0s

running (2m03.0s), 210/210 VUs, 27816 complete and 0 interrupted iterations
countQuery   [  93% ] 52 VUs   1m51.6s/2m0s
feedQuery    [  93% ] 158 VUs  1m51.6s/2m0s

running (2m04.0s), 210/210 VUs, 28053 complete and 0 interrupted iterations
countQuery   [  94% ] 52 VUs   1m52.6s/2m0s
feedQuery    [  94% ] 158 VUs  1m52.6s/2m0s

running (2m05.0s), 210/210 VUs, 28296 complete and 0 interrupted iterations
countQuery   [  95% ] 52 VUs   1m53.6s/2m0s
feedQuery    [  95% ] 158 VUs  1m53.6s/2m0s

running (2m06.0s), 210/210 VUs, 28558 complete and 0 interrupted iterations
countQuery   [  95% ] 52 VUs   1m54.6s/2m0s
feedQuery    [  95% ] 158 VUs  1m54.6s/2m0s

running (2m07.0s), 210/210 VUs, 28820 complete and 0 interrupted iterations
countQuery   [  96% ] 52 VUs   1m55.6s/2m0s
feedQuery    [  96% ] 158 VUs  1m55.6s/2m0s

running (2m08.0s), 210/210 VUs, 29082 complete and 0 interrupted iterations
countQuery   [  97% ] 52 VUs   1m56.6s/2m0s
feedQuery    [  97% ] 158 VUs  1m56.6s/2m0s

running (2m09.0s), 210/210 VUs, 29344 complete and 0 interrupted iterations
countQuery   [  98% ] 52 VUs   1m57.6s/2m0s
feedQuery    [  98% ] 158 VUs  1m57.6s/2m0s

running (2m10.0s), 210/210 VUs, 29606 complete and 0 interrupted iterations
countQuery   [  99% ] 52 VUs   1m58.6s/2m0s
feedQuery    [  99% ] 158 VUs  1m58.6s/2m0s

running (2m11.0s), 210/210 VUs, 29868 complete and 0 interrupted iterations
countQuery   [ 100% ] 52 VUs   1m59.6s/2m0s
feedQuery    [ 100% ] 158 VUs  1m59.6s/2m0s

running (2m12.0s), 133/210 VUs, 30078 complete and 0 interrupted iterations
countQuery ✓ [ 100% ] 52 VUs   2m0s
feedQuery  ↓ [ 100% ] 158 VUs  2m0s


  █ THRESHOLDS 

    http_req_duration
    ✓ 'p(95)<800' p(95)=61.87ms

      {scenario:countQuery}
      ✓ 'p(95)<400' p(95)=46.53ms

      {scenario:feedQuery}
      ✓ 'p(95)<800' p(95)=66.57ms

    http_req_failed
    ✓ 'rate<0.01' rate=0.00%


  █ TOTAL RESULTS 

    checks_total.......: 60882   459.697865/s
    checks_succeeded...: 100.00% 60882 out of 60882
    checks_failed......: 0.00%   0 out of 60882

    ✓ register 201
    ✓ login 200
    ✓ count 200
    ✓ count tem newItems
    ✓ feed 200
    ✓ feed tem items

    HTTP
    http_req_duration..............: avg=34.61ms  min=4.06ms   med=32.43ms max=243.04ms p(90)=54.51ms p(95)=61.87ms
      { expected_response:true }...: avg=34.61ms  min=4.06ms   med=32.43ms max=243.04ms p(90)=54.51ms p(95)=61.87ms
      { scenario:countQuery }......: avg=23.51ms  min=4.06ms   med=20.23ms max=229.69ms p(90)=39.69ms p(95)=46.53ms
      { scenario:feedQuery }.......: avg=42.07ms  min=8.68ms   med=39.46ms max=243.04ms p(90)=58.35ms p(95)=66.57ms
    http_req_failed................: 0.00% 0 out of 30671
    http_reqs......................: 30671 231.585579/s

    EXECUTION
    iteration_duration.............: avg=838.21ms min=504.13ms med=1.02s   max=1.24s    p(90)=1.05s   p(95)=1.06s  
    iterations.....................: 30211 228.112286/s
    vus............................: 133   min=0          max=210
    vus_max........................: 210   min=210        max=210

    NETWORK
    data_received..................: 13 MB 98 kB/s
    data_sent......................: 12 MB 88 kB/s




running (2m12.4s), 000/210 VUs, 30211 complete and 0 interrupted iterations
countQuery ✓ [ 100% ] 52 VUs   2m0s
feedQuery  ✓ [ 100% ] 158 VUs  2m0s

================================================================
% cd DomainFeed/feed && k6 run feed-spike.js
================================================================


         /\      Grafana   /‾‾/  
    /\  /  \     |\  __   /  /   
   /  \/    \    | |/ /  /   ‾‾\ 
  /          \   |   (  |  (‾)  |
 / __________ \  |_|\_\  \_____/ 


     execution: local
        script: feed-spike.js
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
time="2026-05-28T17:44:44-03:00" level=info msg="Setup concluído: 500 usuários prontos." source=console

running (0m25.0s), 002/500 VUs, 0 complete and 0 interrupted iterations
default   [   1% ] 002/500 VUs  00.3s/50.0s

running (0m26.0s), 009/500 VUs, 4 complete and 0 interrupted iterations
default   [   3% ] 009/500 VUs  01.3s/50.0s

running (0m27.0s), 016/500 VUs, 18 complete and 0 interrupted iterations
default   [   5% ] 016/500 VUs  02.3s/50.0s

running (0m28.0s), 023/500 VUs, 42 complete and 0 interrupted iterations
default   [   7% ] 023/500 VUs  03.3s/50.0s

running (0m29.0s), 030/500 VUs, 74 complete and 0 interrupted iterations
default   [   9% ] 030/500 VUs  04.3s/50.0s

running (0m30.0s), 037/500 VUs, 117 complete and 0 interrupted iterations
default   [  11% ] 037/500 VUs  05.3s/50.0s

running (0m31.0s), 044/500 VUs, 170 complete and 0 interrupted iterations
default   [  13% ] 044/500 VUs  06.3s/50.0s

running (0m32.0s), 051/500 VUs, 228 complete and 0 interrupted iterations
default   [  15% ] 051/500 VUs  07.3s/50.0s

running (0m33.0s), 057/500 VUs, 297 complete and 0 interrupted iterations
default   [  17% ] 058/500 VUs  08.3s/50.0s

running (0m34.0s), 064/500 VUs, 378 complete and 0 interrupted iterations
default   [  19% ] 064/500 VUs  09.3s/50.0s

running (0m35.0s), 092/500 VUs, 469 complete and 0 interrupted iterations
default   [  21% ] 092/500 VUs  10.3s/50.0s

running (0m36.0s), 178/500 VUs, 613 complete and 0 interrupted iterations
default   [  23% ] 178/500 VUs  11.3s/50.0s

running (0m37.0s), 264/500 VUs, 870 complete and 0 interrupted iterations
default   [  25% ] 264/500 VUs  12.3s/50.0s

running (0m38.0s), 350/500 VUs, 1254 complete and 0 interrupted iterations
default   [  27% ] 350/500 VUs  13.3s/50.0s

running (0m39.0s), 436/500 VUs, 1718 complete and 0 interrupted iterations
default   [  29% ] 436/500 VUs  14.3s/50.0s

running (0m40.0s), 500/500 VUs, 2278 complete and 0 interrupted iterations
default   [  31% ] 500/500 VUs  15.3s/50.0s

running (0m41.0s), 500/500 VUs, 2830 complete and 0 interrupted iterations
default   [  33% ] 500/500 VUs  16.3s/50.0s

running (0m42.0s), 500/500 VUs, 3417 complete and 0 interrupted iterations
default   [  35% ] 500/500 VUs  17.3s/50.0s

running (0m43.0s), 500/500 VUs, 3928 complete and 0 interrupted iterations
default   [  37% ] 500/500 VUs  18.3s/50.0s

running (0m44.0s), 500/500 VUs, 4502 complete and 0 interrupted iterations
default   [  39% ] 500/500 VUs  19.3s/50.0s

running (0m45.0s), 500/500 VUs, 5114 complete and 0 interrupted iterations
default   [  41% ] 500/500 VUs  20.3s/50.0s

running (0m46.0s), 500/500 VUs, 5748 complete and 0 interrupted iterations
default   [  43% ] 500/500 VUs  21.3s/50.0s

running (0m47.0s), 500/500 VUs, 6336 complete and 0 interrupted iterations
default   [  45% ] 500/500 VUs  22.3s/50.0s

running (0m48.0s), 500/500 VUs, 6946 complete and 0 interrupted iterations
default   [  47% ] 500/500 VUs  23.3s/50.0s

running (0m49.0s), 500/500 VUs, 7493 complete and 0 interrupted iterations
default   [  49% ] 500/500 VUs  24.3s/50.0s

running (0m50.0s), 500/500 VUs, 8111 complete and 0 interrupted iterations
default   [  51% ] 500/500 VUs  25.3s/50.0s

running (0m51.0s), 500/500 VUs, 8716 complete and 0 interrupted iterations
default   [  53% ] 500/500 VUs  26.3s/50.0s

running (0m52.0s), 500/500 VUs, 9323 complete and 0 interrupted iterations
default   [  55% ] 500/500 VUs  27.3s/50.0s

running (0m53.0s), 500/500 VUs, 9938 complete and 0 interrupted iterations
default   [  57% ] 500/500 VUs  28.3s/50.0s

running (0m54.0s), 500/500 VUs, 10567 complete and 0 interrupted iterations
default   [  59% ] 500/500 VUs  29.3s/50.0s

running (0m55.0s), 500/500 VUs, 11166 complete and 0 interrupted iterations
default   [  61% ] 500/500 VUs  30.3s/50.0s

running (0m56.0s), 500/500 VUs, 11780 complete and 0 interrupted iterations
default   [  63% ] 500/500 VUs  31.3s/50.0s

running (0m57.0s), 500/500 VUs, 12364 complete and 0 interrupted iterations
default   [  65% ] 500/500 VUs  32.3s/50.0s

running (0m58.0s), 500/500 VUs, 12992 complete and 0 interrupted iterations
default   [  67% ] 500/500 VUs  33.3s/50.0s

running (0m59.0s), 500/500 VUs, 13563 complete and 0 interrupted iterations
default   [  69% ] 500/500 VUs  34.3s/50.0s

running (1m00.0s), 492/500 VUs, 14198 complete and 0 interrupted iterations
default   [  71% ] 492/500 VUs  35.3s/50.0s

running (1m01.0s), 422/500 VUs, 14820 complete and 0 interrupted iterations
default   [  73% ] 422/500 VUs  36.3s/50.0s

running (1m02.0s), 333/500 VUs, 15385 complete and 0 interrupted iterations
default   [  75% ] 333/500 VUs  37.3s/50.0s

running (1m03.0s), 254/500 VUs, 15815 complete and 0 interrupted iterations
default   [  77% ] 254/500 VUs  38.3s/50.0s

running (1m04.0s), 166/500 VUs, 16155 complete and 0 interrupted iterations
default   [  79% ] 166/500 VUs  39.3s/50.0s

running (1m05.0s), 082/500 VUs, 16366 complete and 0 interrupted iterations
default   [  81% ] 082/500 VUs  40.3s/50.0s

running (1m06.0s), 064/500 VUs, 16475 complete and 0 interrupted iterations
default   [  83% ] 064/500 VUs  41.3s/50.0s

running (1m07.0s), 057/500 VUs, 16565 complete and 0 interrupted iterations
default   [  85% ] 057/500 VUs  42.3s/50.0s

running (1m08.0s), 050/500 VUs, 16644 complete and 0 interrupted iterations
default   [  87% ] 050/500 VUs  43.3s/50.0s

running (1m09.0s), 044/500 VUs, 16712 complete and 0 interrupted iterations
default   [  89% ] 044/500 VUs  44.3s/50.0s

running (1m10.0s), 036/500 VUs, 16768 complete and 0 interrupted iterations
default   [  91% ] 036/500 VUs  45.3s/50.0s

running (1m11.0s), 027/500 VUs, 16818 complete and 0 interrupted iterations
default   [  93% ] 027/500 VUs  46.3s/50.0s

running (1m12.0s), 022/500 VUs, 16856 complete and 0 interrupted iterations
default   [  95% ] 022/500 VUs  47.3s/50.0s

running (1m13.0s), 017/500 VUs, 16881 complete and 0 interrupted iterations
default   [  97% ] 017/500 VUs  48.3s/50.0s

running (1m14.0s), 009/500 VUs, 16904 complete and 0 interrupted iterations
default   [  99% ] 009/500 VUs  49.3s/50.0s

running (1m15.0s), 001/500 VUs, 16914 complete and 0 interrupted iterations
default ↓ [ 100% ] 002/500 VUs  50s


  █ THRESHOLDS 

    http_req_duration
    ✓ 'p(95)<800' p(95)=130.34ms

    http_req_failed
    ✓ 'rate<0.05' rate=0.00%


  █ TOTAL RESULTS 

    checks_total.......: 68660   911.897318/s
    checks_succeeded...: 100.00% 68660 out of 68660
    checks_failed......: 0.00%   0 out of 68660

    ✓ register 201
    ✓ login 200
    ✓ feed 200
    ✓ feed tem items
    ✓ count 200
    ✓ count tem newItems

    HTTP
    http_req_duration..............: avg=54.95ms  min=3.48ms   med=48.67ms  max=387.26ms p(90)=104.96ms p(95)=130.34ms
      { expected_response:true }...: avg=54.95ms  min=3.48ms   med=48.67ms  max=387.26ms p(90)=104.96ms p(95)=130.34ms
    http_req_failed................: 0.00% 0 out of 34830
    http_reqs......................: 34830 462.589333/s

    EXECUTION
    iteration_duration.............: avg=812.18ms min=712.66ms med=805.39ms max=1.16s    p(90)=901.88ms p(95)=941.02ms
    iterations.....................: 16915 224.653993/s
    vus............................: 1     min=0          max=500
    vus_max........................: 500   min=500        max=500

    NETWORK
    data_received..................: 15 MB 198 kB/s
    data_sent......................: 13 MB 178 kB/s




running (1m15.3s), 000/500 VUs, 16915 complete and 0 interrupted iterations
default ✓ [ 100% ] 000/500 VUs  50s

================================================================
% cd DomainFeed/feed && k6 run feed-stress.js
================================================================


         /\      Grafana   /‾‾/  
    /\  /  \     |\  __   /  /   
   /  \/    \    | |/ /  /   ‾‾\ 
  /          \   |   (  |  (‾)  |
 / __________ \  |_|\_\  \_____/ 


     execution: local
        script: feed-stress.js
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
time="2026-05-28T17:46:14-03:00" level=info msg="Setup concluído: 800 usuários prontos." source=console

running (0m40.0s), 001/600 VUs, 1 complete and 0 interrupted iterations
default   [   0% ] 001/600 VUs  0m00.9s/4m00.0s

running (0m41.0s), 002/600 VUs, 2 complete and 0 interrupted iterations
default   [   1% ] 002/600 VUs  0m01.9s/4m00.0s

running (0m42.0s), 002/600 VUs, 4 complete and 0 interrupted iterations
default   [   1% ] 002/600 VUs  0m02.9s/4m00.0s

running (0m43.0s), 003/600 VUs, 8 complete and 0 interrupted iterations
default   [   2% ] 003/600 VUs  0m03.9s/4m00.0s

running (0m44.0s), 004/600 VUs, 12 complete and 0 interrupted iterations
default   [   2% ] 004/600 VUs  0m04.9s/4m00.0s

running (0m45.0s), 004/600 VUs, 16 complete and 0 interrupted iterations
default   [   2% ] 004/600 VUs  0m05.9s/4m00.0s

running (0m46.0s), 005/600 VUs, 22 complete and 0 interrupted iterations
default   [   3% ] 005/600 VUs  0m06.9s/4m00.0s

running (0m47.0s), 005/600 VUs, 30 complete and 0 interrupted iterations
default   [   3% ] 005/600 VUs  0m07.9s/4m00.0s

running (0m48.0s), 006/600 VUs, 36 complete and 0 interrupted iterations
default   [   4% ] 006/600 VUs  0m08.9s/4m00.0s

running (0m49.0s), 007/600 VUs, 44 complete and 0 interrupted iterations
default   [   4% ] 007/600 VUs  0m09.9s/4m00.0s

running (0m50.0s), 007/600 VUs, 54 complete and 0 interrupted iterations
default   [   5% ] 007/600 VUs  0m10.9s/4m00.0s

running (0m51.0s), 008/600 VUs, 64 complete and 0 interrupted iterations
default   [   5% ] 008/600 VUs  0m11.9s/4m00.0s

running (0m52.0s), 009/600 VUs, 74 complete and 0 interrupted iterations
default   [   5% ] 009/600 VUs  0m12.9s/4m00.0s

running (0m53.0s), 009/600 VUs, 86 complete and 0 interrupted iterations
default   [   6% ] 009/600 VUs  0m13.9s/4m00.0s

running (0m54.0s), 010/600 VUs, 98 complete and 0 interrupted iterations
default   [   6% ] 010/600 VUs  0m14.9s/4m00.0s

running (0m55.0s), 011/600 VUs, 112 complete and 0 interrupted iterations
default   [   7% ] 011/600 VUs  0m15.9s/4m00.0s

running (0m56.0s), 011/600 VUs, 126 complete and 0 interrupted iterations
default   [   7% ] 011/600 VUs  0m16.9s/4m00.0s

running (0m57.0s), 012/600 VUs, 140 complete and 0 interrupted iterations
default   [   7% ] 012/600 VUs  0m17.9s/4m00.0s

running (0m58.0s), 012/600 VUs, 157 complete and 0 interrupted iterations
default   [   8% ] 012/600 VUs  0m18.9s/4m00.0s

running (0m59.0s), 013/600 VUs, 174 complete and 0 interrupted iterations
default   [   8% ] 013/600 VUs  0m19.9s/4m00.0s

running (1m00.0s), 014/600 VUs, 191 complete and 0 interrupted iterations
default   [   9% ] 014/600 VUs  0m20.9s/4m00.0s

running (1m01.0s), 014/600 VUs, 210 complete and 0 interrupted iterations
default   [   9% ] 014/600 VUs  0m21.9s/4m00.0s

running (1m02.0s), 015/600 VUs, 229 complete and 0 interrupted iterations
default   [  10% ] 015/600 VUs  0m22.9s/4m00.0s

running (1m03.0s), 016/600 VUs, 247 complete and 0 interrupted iterations
default   [  10% ] 016/600 VUs  0m23.9s/4m00.0s

running (1m04.0s), 016/600 VUs, 270 complete and 0 interrupted iterations
default   [  10% ] 016/600 VUs  0m24.9s/4m00.0s

running (1m05.0s), 017/600 VUs, 292 complete and 0 interrupted iterations
default   [  11% ] 017/600 VUs  0m25.9s/4m00.0s

running (1m06.0s), 018/600 VUs, 315 complete and 0 interrupted iterations
default   [  11% ] 018/600 VUs  0m26.9s/4m00.0s

running (1m07.0s), 018/600 VUs, 338 complete and 0 interrupted iterations
default   [  12% ] 018/600 VUs  0m27.9s/4m00.0s

running (1m08.0s), 019/600 VUs, 365 complete and 0 interrupted iterations
default   [  12% ] 019/600 VUs  0m28.9s/4m00.0s

running (1m09.0s), 019/600 VUs, 388 complete and 0 interrupted iterations
default   [  12% ] 019/600 VUs  0m29.9s/4m00.0s

running (1m10.0s), 020/600 VUs, 414 complete and 0 interrupted iterations
default   [  13% ] 020/600 VUs  0m30.9s/4m00.0s

running (1m11.0s), 021/600 VUs, 444 complete and 0 interrupted iterations
default   [  13% ] 021/600 VUs  0m31.9s/4m00.0s

running (1m12.0s), 022/600 VUs, 470 complete and 0 interrupted iterations
default   [  14% ] 022/600 VUs  0m32.9s/4m00.0s

running (1m13.0s), 023/600 VUs, 500 complete and 0 interrupted iterations
default   [  14% ] 023/600 VUs  0m33.9s/4m00.0s

running (1m14.0s), 024/600 VUs, 534 complete and 0 interrupted iterations
default   [  15% ] 024/600 VUs  0m34.9s/4m00.0s

running (1m15.0s), 025/600 VUs, 564 complete and 0 interrupted iterations
default   [  15% ] 025/600 VUs  0m35.9s/4m00.0s

running (1m16.0s), 026/600 VUs, 598 complete and 0 interrupted iterations
default   [  15% ] 026/600 VUs  0m36.9s/4m00.0s

running (1m17.0s), 027/600 VUs, 636 complete and 0 interrupted iterations
default   [  16% ] 027/600 VUs  0m37.9s/4m00.0s

running (1m18.0s), 028/600 VUs, 670 complete and 0 interrupted iterations
default   [  16% ] 028/600 VUs  0m38.9s/4m00.0s

running (1m19.0s), 029/600 VUs, 708 complete and 0 interrupted iterations
default   [  17% ] 029/600 VUs  0m39.9s/4m00.0s

running (1m20.0s), 030/600 VUs, 750 complete and 0 interrupted iterations
default   [  17% ] 030/600 VUs  0m40.9s/4m00.0s

running (1m21.0s), 031/600 VUs, 788 complete and 0 interrupted iterations
default   [  17% ] 031/600 VUs  0m41.9s/4m00.0s

running (1m22.0s), 032/600 VUs, 830 complete and 0 interrupted iterations
default   [  18% ] 032/600 VUs  0m42.9s/4m00.0s

running (1m23.0s), 033/600 VUs, 876 complete and 0 interrupted iterations
default   [  18% ] 033/600 VUs  0m43.9s/4m00.0s

running (1m24.0s), 034/600 VUs, 918 complete and 0 interrupted iterations
default   [  19% ] 034/600 VUs  0m44.9s/4m00.0s

running (1m25.0s), 035/600 VUs, 964 complete and 0 interrupted iterations
default   [  19% ] 035/600 VUs  0m45.9s/4m00.0s

running (1m26.0s), 036/600 VUs, 1014 complete and 0 interrupted iterations
default   [  20% ] 036/600 VUs  0m46.9s/4m00.0s

running (1m27.0s), 037/600 VUs, 1060 complete and 0 interrupted iterations
default   [  20% ] 037/600 VUs  0m47.9s/4m00.0s

running (1m28.0s), 038/600 VUs, 1110 complete and 0 interrupted iterations
default   [  20% ] 038/600 VUs  0m48.9s/4m00.0s

running (1m29.0s), 039/600 VUs, 1164 complete and 0 interrupted iterations
default   [  21% ] 039/600 VUs  0m49.9s/4m00.0s

running (1m30.0s), 040/600 VUs, 1214 complete and 0 interrupted iterations
default   [  21% ] 040/600 VUs  0m50.9s/4m00.0s

running (1m31.0s), 041/600 VUs, 1268 complete and 0 interrupted iterations
default   [  22% ] 041/600 VUs  0m51.9s/4m00.0s

running (1m32.0s), 042/600 VUs, 1311 complete and 0 interrupted iterations
default   [  22% ] 042/600 VUs  0m52.9s/4m00.0s

running (1m33.0s), 043/600 VUs, 1380 complete and 0 interrupted iterations
default   [  22% ] 043/600 VUs  0m53.9s/4m00.0s

running (1m34.0s), 044/600 VUs, 1438 complete and 0 interrupted iterations
default   [  23% ] 044/600 VUs  0m54.9s/4m00.0s

running (1m35.0s), 045/600 VUs, 1485 complete and 0 interrupted iterations
default   [  23% ] 045/600 VUs  0m55.9s/4m00.0s

running (1m36.0s), 046/600 VUs, 1558 complete and 0 interrupted iterations
default   [  24% ] 046/600 VUs  0m56.9s/4m00.0s

running (1m37.0s), 047/600 VUs, 1618 complete and 0 interrupted iterations
default   [  24% ] 047/600 VUs  0m57.9s/4m00.0s

running (1m38.0s), 048/600 VUs, 1671 complete and 0 interrupted iterations
default   [  25% ] 048/600 VUs  0m58.9s/4m00.0s

running (1m39.0s), 049/600 VUs, 1738 complete and 0 interrupted iterations
default   [  25% ] 049/600 VUs  0m59.9s/4m00.0s

running (1m40.0s), 051/600 VUs, 1812 complete and 0 interrupted iterations
default   [  25% ] 051/600 VUs  1m00.9s/4m00.0s

running (1m41.0s), 053/600 VUs, 1869 complete and 0 interrupted iterations
default   [  26% ] 053/600 VUs  1m01.9s/4m00.0s

running (1m42.0s), 054/600 VUs, 1942 complete and 0 interrupted iterations
default   [  26% ] 054/600 VUs  1m02.9s/4m00.0s

running (1m43.0s), 056/600 VUs, 2012 complete and 0 interrupted iterations
default   [  27% ] 056/600 VUs  1m03.9s/4m00.0s

running (1m44.0s), 058/600 VUs, 2087 complete and 0 interrupted iterations
default   [  27% ] 058/600 VUs  1m04.9s/4m00.0s

running (1m45.0s), 059/600 VUs, 2167 complete and 0 interrupted iterations
default   [  27% ] 059/600 VUs  1m05.9s/4m00.0s

running (1m46.0s), 061/600 VUs, 2243 complete and 0 interrupted iterations
default   [  28% ] 061/600 VUs  1m06.9s/4m00.0s

running (1m47.0s), 063/600 VUs, 2325 complete and 0 interrupted iterations
default   [  28% ] 063/600 VUs  1m07.9s/4m00.0s

running (1m48.0s), 064/600 VUs, 2412 complete and 0 interrupted iterations
default   [  29% ] 064/600 VUs  1m08.9s/4m00.0s

running (1m49.0s), 066/600 VUs, 2494 complete and 0 interrupted iterations
default   [  29% ] 066/600 VUs  1m09.9s/4m00.0s

running (1m50.0s), 068/600 VUs, 2583 complete and 0 interrupted iterations
default   [  30% ] 068/600 VUs  1m10.9s/4m00.0s

running (1m51.0s), 069/600 VUs, 2677 complete and 0 interrupted iterations
default   [  30% ] 069/600 VUs  1m11.9s/4m00.0s

running (1m52.0s), 071/600 VUs, 2765 complete and 0 interrupted iterations
default   [  30% ] 071/600 VUs  1m12.9s/4m00.0s

running (1m53.0s), 073/600 VUs, 2861 complete and 0 interrupted iterations
default   [  31% ] 073/600 VUs  1m13.9s/4m00.0s

running (1m54.0s), 074/600 VUs, 2962 complete and 0 interrupted iterations
default   [  31% ] 074/600 VUs  1m14.9s/4m00.0s

running (1m55.0s), 076/600 VUs, 3057 complete and 0 interrupted iterations
default   [  32% ] 076/600 VUs  1m15.9s/4m00.0s

running (1m56.0s), 078/600 VUs, 3159 complete and 0 interrupted iterations
default   [  32% ] 078/600 VUs  1m16.9s/4m00.0s

running (1m57.0s), 079/600 VUs, 3267 complete and 0 interrupted iterations
default   [  32% ] 079/600 VUs  1m17.9s/4m00.0s

running (1m58.0s), 081/600 VUs, 3369 complete and 0 interrupted iterations
default   [  33% ] 081/600 VUs  1m18.9s/4m00.0s

running (1m59.0s), 083/600 VUs, 3477 complete and 0 interrupted iterations
default   [  33% ] 083/600 VUs  1m19.9s/4m00.0s

running (2m00.0s), 084/600 VUs, 3592 complete and 0 interrupted iterations
default   [  34% ] 084/600 VUs  1m20.9s/4m00.0s

running (2m01.0s), 086/600 VUs, 3702 complete and 0 interrupted iterations
default   [  34% ] 086/600 VUs  1m21.9s/4m00.0s

running (2m02.0s), 088/600 VUs, 3815 complete and 0 interrupted iterations
default   [  35% ] 088/600 VUs  1m22.9s/4m00.0s

running (2m03.0s), 089/600 VUs, 3937 complete and 0 interrupted iterations
default   [  35% ] 089/600 VUs  1m23.9s/4m00.0s

running (2m04.0s), 091/600 VUs, 4053 complete and 0 interrupted iterations
default   [  35% ] 091/600 VUs  1m24.9s/4m00.0s

running (2m05.0s), 093/600 VUs, 4177 complete and 0 interrupted iterations
default   [  36% ] 093/600 VUs  1m25.9s/4m00.0s

running (2m06.0s), 094/600 VUs, 4314 complete and 0 interrupted iterations
default   [  36% ] 094/600 VUs  1m26.9s/4m00.0s

running (2m07.0s), 096/600 VUs, 4425 complete and 0 interrupted iterations
default   [  37% ] 096/600 VUs  1m27.9s/4m00.0s

running (2m08.0s), 098/600 VUs, 4556 complete and 0 interrupted iterations
default   [  37% ] 098/600 VUs  1m28.9s/4m00.0s

running (2m09.0s), 099/600 VUs, 4703 complete and 0 interrupted iterations
default   [  37% ] 099/600 VUs  1m29.9s/4m00.0s

running (2m10.0s), 102/600 VUs, 4817 complete and 0 interrupted iterations
default   [  38% ] 102/600 VUs  1m30.9s/4m00.0s

running (2m11.0s), 106/600 VUs, 4962 complete and 0 interrupted iterations
default   [  38% ] 106/600 VUs  1m31.9s/4m00.0s

running (2m12.0s), 109/600 VUs, 5127 complete and 0 interrupted iterations
default   [  39% ] 109/600 VUs  1m32.9s/4m00.0s

running (2m13.0s), 112/600 VUs, 5243 complete and 0 interrupted iterations
default   [  39% ] 112/600 VUs  1m33.9s/4m00.0s

running (2m14.0s), 116/600 VUs, 5428 complete and 0 interrupted iterations
default   [  40% ] 116/600 VUs  1m34.9s/4m00.0s

running (2m15.0s), 119/600 VUs, 5582 complete and 0 interrupted iterations
default   [  40% ] 119/600 VUs  1m35.9s/4m00.0s

running (2m16.0s), 122/600 VUs, 5723 complete and 0 interrupted iterations
default   [  40% ] 122/600 VUs  1m36.9s/4m00.0s

running (2m17.0s), 126/600 VUs, 5927 complete and 0 interrupted iterations
default   [  41% ] 126/600 VUs  1m37.9s/4m00.0s

running (2m18.0s), 129/600 VUs, 6076 complete and 0 interrupted iterations
default   [  41% ] 129/600 VUs  1m38.9s/4m00.0s

running (2m19.0s), 132/600 VUs, 6262 complete and 0 interrupted iterations
default   [  42% ] 132/600 VUs  1m39.9s/4m00.0s

running (2m20.0s), 136/600 VUs, 6446 complete and 0 interrupted iterations
default   [  42% ] 136/600 VUs  1m40.9s/4m00.0s

running (2m21.0s), 139/600 VUs, 6614 complete and 0 interrupted iterations
default   [  42% ] 139/600 VUs  1m41.9s/4m00.0s

running (2m22.0s), 142/600 VUs, 6808 complete and 0 interrupted iterations
default   [  43% ] 142/600 VUs  1m42.9s/4m00.0s

running (2m23.0s), 146/600 VUs, 7022 complete and 0 interrupted iterations
default   [  43% ] 146/600 VUs  1m43.9s/4m00.0s

running (2m24.0s), 149/600 VUs, 7187 complete and 0 interrupted iterations
default   [  44% ] 149/600 VUs  1m44.9s/4m00.0s

running (2m25.0s), 152/600 VUs, 7394 complete and 0 interrupted iterations
default   [  44% ] 152/600 VUs  1m45.9s/4m00.0s

running (2m26.0s), 156/600 VUs, 7634 complete and 0 interrupted iterations
default   [  45% ] 156/600 VUs  1m46.9s/4m00.0s

running (2m27.0s), 159/600 VUs, 7808 complete and 0 interrupted iterations
default   [  45% ] 159/600 VUs  1m47.9s/4m00.0s

running (2m28.0s), 162/600 VUs, 8066 complete and 0 interrupted iterations
default   [  45% ] 162/600 VUs  1m48.9s/4m00.0s

running (2m29.0s), 166/600 VUs, 8278 complete and 0 interrupted iterations
default   [  46% ] 166/600 VUs  1m49.9s/4m00.0s

running (2m30.0s), 169/600 VUs, 8488 complete and 0 interrupted iterations
default   [  46% ] 169/600 VUs  1m50.9s/4m00.0s

running (2m31.0s), 172/600 VUs, 8741 complete and 0 interrupted iterations
default   [  47% ] 172/600 VUs  1m51.9s/4m00.0s

running (2m32.0s), 176/600 VUs, 8957 complete and 0 interrupted iterations
default   [  47% ] 176/600 VUs  1m52.9s/4m00.0s

running (2m33.0s), 179/600 VUs, 9209 complete and 0 interrupted iterations
default   [  47% ] 179/600 VUs  1m53.9s/4m00.0s

running (2m34.0s), 182/600 VUs, 9483 complete and 0 interrupted iterations
default   [  48% ] 182/600 VUs  1m54.9s/4m00.0s

running (2m35.0s), 186/600 VUs, 9705 complete and 0 interrupted iterations
default   [  48% ] 186/600 VUs  1m55.9s/4m00.0s

running (2m36.0s), 189/600 VUs, 9972 complete and 0 interrupted iterations
default   [  49% ] 189/600 VUs  1m56.9s/4m00.0s

running (2m37.0s), 192/600 VUs, 10237 complete and 0 interrupted iterations
default   [  49% ] 192/600 VUs  1m57.9s/4m00.0s

running (2m38.0s), 196/600 VUs, 10485 complete and 0 interrupted iterations
default   [  50% ] 196/600 VUs  1m58.9s/4m00.0s

running (2m39.0s), 199/600 VUs, 10780 complete and 0 interrupted iterations
default   [  50% ] 199/600 VUs  1m59.9s/4m00.0s

running (2m40.0s), 202/600 VUs, 11026 complete and 0 interrupted iterations
default   [  50% ] 202/600 VUs  2m00.9s/4m00.0s

running (2m41.0s), 206/600 VUs, 11315 complete and 0 interrupted iterations
default   [  51% ] 206/600 VUs  2m01.9s/4m00.0s

running (2m42.0s), 209/600 VUs, 11629 complete and 0 interrupted iterations
default   [  51% ] 209/600 VUs  2m02.9s/4m00.0s

running (2m43.0s), 212/600 VUs, 11884 complete and 0 interrupted iterations
default   [  52% ] 212/600 VUs  2m03.9s/4m00.0s

running (2m44.0s), 216/600 VUs, 12200 complete and 0 interrupted iterations
default   [  52% ] 216/600 VUs  2m04.9s/4m00.0s

running (2m45.0s), 219/600 VUs, 12489 complete and 0 interrupted iterations
default   [  52% ] 219/600 VUs  2m05.9s/4m00.0s

running (2m46.0s), 222/600 VUs, 12770 complete and 0 interrupted iterations
default   [  53% ] 222/600 VUs  2m06.9s/4m00.0s

running (2m47.0s), 226/600 VUs, 13110 complete and 0 interrupted iterations
default   [  53% ] 226/600 VUs  2m07.9s/4m00.0s

running (2m48.0s), 229/600 VUs, 13382 complete and 0 interrupted iterations
default   [  54% ] 229/600 VUs  2m08.9s/4m00.0s

running (2m49.0s), 232/600 VUs, 13720 complete and 0 interrupted iterations
default   [  54% ] 232/600 VUs  2m09.9s/4m00.0s

running (2m50.0s), 236/600 VUs, 14052 complete and 0 interrupted iterations
default   [  55% ] 236/600 VUs  2m10.9s/4m00.0s

running (2m51.0s), 239/600 VUs, 14364 complete and 0 interrupted iterations
default   [  55% ] 239/600 VUs  2m11.9s/4m00.0s

running (2m52.0s), 242/600 VUs, 14694 complete and 0 interrupted iterations
default   [  55% ] 242/600 VUs  2m12.9s/4m00.0s

running (2m53.0s), 246/600 VUs, 15035 complete and 0 interrupted iterations
default   [  56% ] 246/600 VUs  2m13.9s/4m00.0s

running (2m54.0s), 249/600 VUs, 15358 complete and 0 interrupted iterations
default   [  56% ] 249/600 VUs  2m14.9s/4m00.0s

running (2m55.0s), 252/600 VUs, 15728 complete and 0 interrupted iterations
default   [  57% ] 252/600 VUs  2m15.9s/4m00.0s

running (2m56.0s), 256/600 VUs, 16038 complete and 0 interrupted iterations
default   [  57% ] 256/600 VUs  2m16.9s/4m00.0s

running (2m57.0s), 259/600 VUs, 16410 complete and 0 interrupted iterations
default   [  57% ] 259/600 VUs  2m17.9s/4m00.0s

running (2m58.0s), 262/600 VUs, 16781 complete and 0 interrupted iterations
default   [  58% ] 262/600 VUs  2m18.9s/4m00.0s

running (2m59.0s), 266/600 VUs, 17126 complete and 0 interrupted iterations
default   [  58% ] 266/600 VUs  2m19.9s/4m00.0s

running (3m00.0s), 269/600 VUs, 17495 complete and 0 interrupted iterations
default   [  59% ] 269/600 VUs  2m20.9s/4m00.0s

running (3m01.0s), 272/600 VUs, 17872 complete and 0 interrupted iterations
default   [  59% ] 272/600 VUs  2m21.9s/4m00.0s

running (3m02.0s), 276/600 VUs, 18242 complete and 0 interrupted iterations
default   [  60% ] 276/600 VUs  2m22.9s/4m00.0s

running (3m03.0s), 279/600 VUs, 18638 complete and 0 interrupted iterations
default   [  60% ] 279/600 VUs  2m23.9s/4m00.0s

running (3m04.0s), 282/600 VUs, 19002 complete and 0 interrupted iterations
default   [  60% ] 282/600 VUs  2m24.9s/4m00.0s

running (3m05.0s), 286/600 VUs, 19395 complete and 0 interrupted iterations
default   [  61% ] 286/600 VUs  2m25.9s/4m00.0s

running (3m06.0s), 289/600 VUs, 19805 complete and 0 interrupted iterations
default   [  61% ] 289/600 VUs  2m26.9s/4m00.0s

running (3m07.0s), 292/600 VUs, 20184 complete and 0 interrupted iterations
default   [  62% ] 292/600 VUs  2m27.9s/4m00.0s

running (3m08.0s), 296/600 VUs, 20595 complete and 0 interrupted iterations
default   [  62% ] 296/600 VUs  2m28.9s/4m00.0s

running (3m09.0s), 299/600 VUs, 21005 complete and 0 interrupted iterations
default   [  62% ] 299/600 VUs  2m29.9s/4m00.0s

running (3m10.0s), 302/600 VUs, 21399 complete and 0 interrupted iterations
default   [  63% ] 302/600 VUs  2m30.9s/4m00.0s

running (3m11.0s), 306/600 VUs, 21834 complete and 0 interrupted iterations
default   [  63% ] 306/600 VUs  2m31.9s/4m00.0s

running (3m12.0s), 309/600 VUs, 22245 complete and 0 interrupted iterations
default   [  64% ] 309/600 VUs  2m32.9s/4m00.0s

running (3m13.0s), 312/600 VUs, 22667 complete and 0 interrupted iterations
default   [  64% ] 312/600 VUs  2m33.9s/4m00.0s

running (3m14.0s), 316/600 VUs, 23122 complete and 0 interrupted iterations
default   [  65% ] 316/600 VUs  2m34.9s/4m00.0s

running (3m15.0s), 319/600 VUs, 23541 complete and 0 interrupted iterations
default   [  65% ] 319/600 VUs  2m35.9s/4m00.0s

running (3m16.0s), 322/600 VUs, 23971 complete and 0 interrupted iterations
default   [  65% ] 322/600 VUs  2m36.9s/4m00.0s

running (3m17.0s), 326/600 VUs, 24433 complete and 0 interrupted iterations
default   [  66% ] 326/600 VUs  2m37.9s/4m00.0s

running (3m18.0s), 329/600 VUs, 24855 complete and 0 interrupted iterations
default   [  66% ] 329/600 VUs  2m38.9s/4m00.0s

running (3m19.0s), 332/600 VUs, 25326 complete and 0 interrupted iterations
default   [  67% ] 332/600 VUs  2m39.9s/4m00.0s

running (3m20.0s), 336/600 VUs, 25771 complete and 0 interrupted iterations
default   [  67% ] 336/600 VUs  2m40.9s/4m00.0s

running (3m21.0s), 339/600 VUs, 26227 complete and 0 interrupted iterations
default   [  67% ] 339/600 VUs  2m41.9s/4m00.0s

running (3m22.0s), 342/600 VUs, 26724 complete and 0 interrupted iterations
default   [  68% ] 342/600 VUs  2m42.9s/4m00.0s

running (3m23.0s), 346/600 VUs, 27169 complete and 0 interrupted iterations
default   [  68% ] 346/600 VUs  2m43.9s/4m00.0s

running (3m24.0s), 349/600 VUs, 27650 complete and 0 interrupted iterations
default   [  69% ] 349/600 VUs  2m44.9s/4m00.0s

running (3m25.0s), 352/600 VUs, 28138 complete and 0 interrupted iterations
default   [  69% ] 352/600 VUs  2m45.9s/4m00.0s

running (3m26.0s), 356/600 VUs, 28604 complete and 0 interrupted iterations
default   [  70% ] 356/600 VUs  2m46.9s/4m00.0s

running (3m27.0s), 359/600 VUs, 29106 complete and 0 interrupted iterations
default   [  70% ] 359/600 VUs  2m47.9s/4m00.0s

running (3m28.0s), 362/600 VUs, 29602 complete and 0 interrupted iterations
default   [  70% ] 362/600 VUs  2m48.9s/4m00.0s

running (3m29.0s), 366/600 VUs, 30093 complete and 0 interrupted iterations
default   [  71% ] 366/600 VUs  2m49.9s/4m00.0s

running (3m30.0s), 369/600 VUs, 30607 complete and 0 interrupted iterations
default   [  71% ] 369/600 VUs  2m50.9s/4m00.0s

running (3m31.0s), 372/600 VUs, 31102 complete and 0 interrupted iterations
default   [  72% ] 372/600 VUs  2m51.9s/4m00.0s

running (3m32.0s), 376/600 VUs, 31598 complete and 0 interrupted iterations
default   [  72% ] 376/600 VUs  2m52.9s/4m00.0s

running (3m33.0s), 379/600 VUs, 32134 complete and 0 interrupted iterations
default   [  72% ] 379/600 VUs  2m53.9s/4m00.0s

running (3m34.0s), 382/600 VUs, 32648 complete and 0 interrupted iterations
default   [  73% ] 382/600 VUs  2m54.9s/4m00.0s

running (3m35.0s), 386/600 VUs, 33169 complete and 0 interrupted iterations
default   [  73% ] 386/600 VUs  2m55.9s/4m00.0s

running (3m36.0s), 389/600 VUs, 33696 complete and 0 interrupted iterations
default   [  74% ] 389/600 VUs  2m56.9s/4m00.0s

running (3m37.0s), 392/600 VUs, 34214 complete and 0 interrupted iterations
default   [  74% ] 392/600 VUs  2m57.9s/4m00.0s

running (3m38.0s), 396/600 VUs, 34722 complete and 0 interrupted iterations
default   [  75% ] 396/600 VUs  2m58.9s/4m00.0s

running (3m39.0s), 399/600 VUs, 35304 complete and 0 interrupted iterations
default   [  75% ] 399/600 VUs  2m59.9s/4m00.0s

running (3m40.0s), 405/600 VUs, 35831 complete and 0 interrupted iterations
default   [  75% ] 405/600 VUs  3m00.9s/4m00.0s

running (3m41.0s), 412/600 VUs, 36348 complete and 0 interrupted iterations
default   [  76% ] 412/600 VUs  3m01.9s/4m00.0s

running (3m42.0s), 419/600 VUs, 36956 complete and 0 interrupted iterations
default   [  76% ] 419/600 VUs  3m02.9s/4m00.0s

running (3m43.0s), 425/600 VUs, 37512 complete and 0 interrupted iterations
default   [  77% ] 425/600 VUs  3m03.9s/4m00.0s

running (3m44.0s), 432/600 VUs, 38063 complete and 0 interrupted iterations
default   [  77% ] 432/600 VUs  3m04.9s/4m00.0s

running (3m45.0s), 439/600 VUs, 38638 complete and 0 interrupted iterations
default   [  77% ] 439/600 VUs  3m05.9s/4m00.0s

running (3m46.0s), 445/600 VUs, 39254 complete and 0 interrupted iterations
default   [  78% ] 445/600 VUs  3m06.9s/4m00.0s

running (3m47.0s), 452/600 VUs, 39831 complete and 0 interrupted iterations
default   [  78% ] 452/600 VUs  3m07.9s/4m00.0s

running (3m48.0s), 459/600 VUs, 40422 complete and 0 interrupted iterations
default   [  79% ] 459/600 VUs  3m08.9s/4m00.0s

running (3m49.0s), 465/600 VUs, 41030 complete and 0 interrupted iterations
default   [  79% ] 465/600 VUs  3m09.9s/4m00.0s

running (3m50.0s), 472/600 VUs, 41614 complete and 0 interrupted iterations
default   [  80% ] 472/600 VUs  3m10.9s/4m00.0s

running (3m51.0s), 479/600 VUs, 42215 complete and 0 interrupted iterations
default   [  80% ] 479/600 VUs  3m11.9s/4m00.0s

running (3m52.0s), 485/600 VUs, 42851 complete and 0 interrupted iterations
default   [  80% ] 485/600 VUs  3m12.9s/4m00.0s

running (3m53.0s), 492/600 VUs, 43481 complete and 0 interrupted iterations
default   [  81% ] 492/600 VUs  3m13.9s/4m00.0s

running (3m54.0s), 499/600 VUs, 44117 complete and 0 interrupted iterations
default   [  81% ] 499/600 VUs  3m14.9s/4m00.0s

running (3m55.0s), 505/600 VUs, 44764 complete and 0 interrupted iterations
default   [  82% ] 505/600 VUs  3m15.9s/4m00.0s

running (3m56.0s), 512/600 VUs, 45347 complete and 0 interrupted iterations
default   [  82% ] 512/600 VUs  3m16.9s/4m00.0s

running (3m57.0s), 519/600 VUs, 45989 complete and 0 interrupted iterations
default   [  82% ] 519/600 VUs  3m17.9s/4m00.0s

running (3m58.0s), 525/600 VUs, 46643 complete and 0 interrupted iterations
default   [  83% ] 525/600 VUs  3m18.9s/4m00.0s

running (3m59.0s), 532/600 VUs, 47274 complete and 0 interrupted iterations
default   [  83% ] 532/600 VUs  3m19.9s/4m00.0s

running (4m00.0s), 539/600 VUs, 47881 complete and 0 interrupted iterations
default   [  84% ] 539/600 VUs  3m20.9s/4m00.0s

running (4m01.0s), 545/600 VUs, 48543 complete and 0 interrupted iterations
default   [  84% ] 545/600 VUs  3m21.9s/4m00.0s

running (4m02.0s), 552/600 VUs, 49189 complete and 0 interrupted iterations
default   [  85% ] 552/600 VUs  3m22.9s/4m00.0s

running (4m03.0s), 559/600 VUs, 49831 complete and 0 interrupted iterations
default   [  85% ] 559/600 VUs  3m23.9s/4m00.0s

running (4m04.0s), 565/600 VUs, 50448 complete and 0 interrupted iterations
default   [  85% ] 565/600 VUs  3m24.9s/4m00.0s

running (4m05.0s), 572/600 VUs, 51040 complete and 0 interrupted iterations
default   [  86% ] 572/600 VUs  3m25.9s/4m00.0s

running (4m06.0s), 579/600 VUs, 51661 complete and 0 interrupted iterations
default   [  86% ] 579/600 VUs  3m26.9s/4m00.0s

running (4m07.0s), 585/600 VUs, 52286 complete and 0 interrupted iterations
default   [  87% ] 585/600 VUs  3m27.9s/4m00.0s

running (4m08.0s), 592/600 VUs, 52910 complete and 0 interrupted iterations
default   [  87% ] 592/600 VUs  3m28.9s/4m00.0s

running (4m09.0s), 599/600 VUs, 53510 complete and 0 interrupted iterations
default   [  87% ] 599/600 VUs  3m29.9s/4m00.0s

running (4m10.0s), 594/600 VUs, 54121 complete and 0 interrupted iterations
default   [  88% ] 594/600 VUs  3m30.9s/4m00.0s

running (4m11.0s), 572/600 VUs, 54795 complete and 0 interrupted iterations
default   [  88% ] 572/600 VUs  3m31.9s/4m00.0s

running (4m12.0s), 551/600 VUs, 55470 complete and 0 interrupted iterations
default   [  89% ] 551/600 VUs  3m32.9s/4m00.0s

running (4m13.0s), 531/600 VUs, 56116 complete and 0 interrupted iterations
default   [  89% ] 531/600 VUs  3m33.9s/4m00.0s

running (4m14.0s), 510/600 VUs, 56732 complete and 0 interrupted iterations
default   [  90% ] 510/600 VUs  3m34.9s/4m00.0s

running (4m15.0s), 492/600 VUs, 57339 complete and 0 interrupted iterations
default   [  90% ] 492/600 VUs  3m35.9s/4m00.0s

running (4m16.0s), 472/600 VUs, 57989 complete and 0 interrupted iterations
default   [  90% ] 472/600 VUs  3m36.9s/4m00.0s

running (4m17.0s), 450/600 VUs, 58632 complete and 0 interrupted iterations
default   [  91% ] 450/600 VUs  3m37.9s/4m00.0s

running (4m18.0s), 432/600 VUs, 59212 complete and 0 interrupted iterations
default   [  91% ] 432/600 VUs  3m38.9s/4m00.0s

running (4m19.0s), 414/600 VUs, 59789 complete and 0 interrupted iterations
default   [  92% ] 414/600 VUs  3m39.9s/4m00.0s

running (4m20.0s), 394/600 VUs, 60307 complete and 0 interrupted iterations
default   [  92% ] 394/600 VUs  3m40.9s/4m00.0s

running (4m21.0s), 369/600 VUs, 60887 complete and 0 interrupted iterations
default   [  92% ] 369/600 VUs  3m41.9s/4m00.0s

running (4m22.0s), 351/600 VUs, 61358 complete and 0 interrupted iterations
default   [  93% ] 351/600 VUs  3m42.9s/4m00.0s

running (4m23.0s), 331/600 VUs, 61839 complete and 0 interrupted iterations
default   [  93% ] 331/600 VUs  3m43.9s/4m00.0s

running (4m24.0s), 311/600 VUs, 62313 complete and 0 interrupted iterations
default   [  94% ] 311/600 VUs  3m44.9s/4m00.0s

running (4m25.0s), 289/600 VUs, 62712 complete and 0 interrupted iterations
default   [  94% ] 289/600 VUs  3m45.9s/4m00.0s

running (4m26.0s), 268/600 VUs, 63124 complete and 0 interrupted iterations
default   [  95% ] 268/600 VUs  3m46.9s/4m00.0s

running (4m27.0s), 247/600 VUs, 63492 complete and 0 interrupted iterations
default   [  95% ] 247/600 VUs  3m47.9s/4m00.0s

running (4m28.0s), 233/600 VUs, 63807 complete and 0 interrupted iterations
default   [  95% ] 233/600 VUs  3m48.9s/4m00.0s

running (4m29.0s), 210/600 VUs, 64160 complete and 0 interrupted iterations
default   [  96% ] 210/600 VUs  3m49.9s/4m00.0s

running (4m30.0s), 190/600 VUs, 64412 complete and 0 interrupted iterations
default   [  96% ] 190/600 VUs  3m50.9s/4m00.0s

running (4m31.0s), 173/600 VUs, 64679 complete and 0 interrupted iterations
default   [  97% ] 173/600 VUs  3m51.9s/4m00.0s

running (4m32.0s), 149/600 VUs, 64925 complete and 0 interrupted iterations
default   [  97% ] 149/600 VUs  3m52.9s/4m00.0s

running (4m33.0s), 131/600 VUs, 65117 complete and 0 interrupted iterations
default   [  97% ] 131/600 VUs  3m53.9s/4m00.0s

running (4m34.0s), 110/600 VUs, 65294 complete and 0 interrupted iterations
default   [  98% ] 110/600 VUs  3m54.9s/4m00.0s

running (4m35.0s), 091/600 VUs, 65445 complete and 0 interrupted iterations
default   [  98% ] 091/600 VUs  3m55.9s/4m00.0s

running (4m36.0s), 070/600 VUs, 65567 complete and 0 interrupted iterations
default   [  99% ] 070/600 VUs  3m56.9s/4m00.0s

running (4m37.0s), 049/600 VUs, 65659 complete and 0 interrupted iterations
default   [  99% ] 049/600 VUs  3m57.9s/4m00.0s

running (4m38.0s), 030/600 VUs, 65723 complete and 0 interrupted iterations
default   [ 100% ] 030/600 VUs  3m58.9s/4m00.0s

running (4m39.0s), 011/600 VUs, 65763 complete and 0 interrupted iterations
default   [ 100% ] 011/600 VUs  3m59.9s/4m00.0s


  █ THRESHOLDS 

    http_req_duration
    ✓ 'p(95)<2000' p(95)=111.99ms

    http_req_failed
    ✓ 'rate<0.05' rate=0.00%


  █ TOTAL RESULTS 

    checks_total.......: 264696  946.722218/s
    checks_succeeded...: 100.00% 264696 out of 264696
    checks_failed......: 0.00%   0 out of 264696

    ✓ register 201
    ✓ login 200
    ✓ feed 200
    ✓ feed tem items
    ✓ count 200
    ✓ count tem newItems

    HTTP
    http_req_duration..............: avg=31.67ms  min=3.38ms   med=17.88ms  max=363.15ms p(90)=81.59ms  p(95)=111.99ms
      { expected_response:true }...: avg=31.67ms  min=3.38ms   med=17.88ms  max=363.15ms p(90)=81.59ms  p(95)=111.99ms
    http_req_failed................: 0.00%  0 out of 133148
    http_reqs......................: 133148 476.222421/s

    EXECUTION
    iteration_duration.............: avg=764.01ms min=710.65ms med=733.34ms max=1.18s    p(90)=865.69ms p(95)=920.33ms
    iterations.....................: 65774  235.249899/s
    vus............................: 11     min=0           max=599
    vus_max........................: 600    min=600         max=600

    NETWORK
    data_received..................: 56 MB  200 kB/s
    data_sent......................: 52 MB  186 kB/s




running (4m39.6s), 000/600 VUs, 65774 complete and 0 interrupted iterations
default ✓ [ 100% ] 000/600 VUs  4m0s

================================================================
% cd DomainFeed/post && k6 run post-load.js
================================================================


         /\      Grafana   /‾‾/  
    /\  /  \     |\  __   /  /   
   /  \/    \    | |/ /  /   ‾‾\ 
  /          \   |   (  |  (‾)  |
 / __________ \  |_|\_\  \_____/ 


     execution: local
        script: post-load.js
        output: -

     scenarios: (100.00%) 2 scenarios, 210 max VUs, 2m30s max duration (incl. graceful stop):
              * crud: 158 looping VUs for 2m0s (exec: crudPost, gracefulStop: 30s)
              * listing: 52 looping VUs for 2m0s (exec: listPosts, gracefulStop: 30s)


Run       [ 100% ] setup()
crud      [   0% ]
listing   [   0% ]

Run       [ 100% ] setup()
crud      [   0% ]
listing   [   0% ]

Run       [ 100% ] setup()
crud      [   0% ]
listing   [   0% ]

Run       [ 100% ] setup()
crud      [   0% ]
listing   [   0% ]

Run       [ 100% ] setup()
crud      [   0% ]
listing   [   0% ]

Run       [ 100% ] setup()
crud      [   0% ]
listing   [   0% ]

Run       [ 100% ] setup()
crud      [   0% ]
listing   [   0% ]

Run       [ 100% ] setup()
crud      [   0% ]
listing   [   0% ]

Run       [ 100% ] setup()
crud      [   0% ]
listing   [   0% ]

Run       [ 100% ] setup()
crud      [   0% ]
listing   [   0% ]

Run       [ 100% ] setup()
crud      [   0% ]
listing   [   0% ]
time="2026-05-28T17:50:26-03:00" level=info msg="Setup concluído: 230 usuários prontos." source=console

running (0m12.0s), 210/210 VUs, 7 complete and 0 interrupted iterations
crud      [   0% ] 158 VUs  0m00.6s/2m0s
listing   [   0% ] 52 VUs   0m00.6s/2m0s

running (0m13.0s), 210/210 VUs, 104 complete and 0 interrupted iterations
crud      [   1% ] 158 VUs  0m01.6s/2m0s
listing   [   1% ] 52 VUs   0m01.6s/2m0s

running (0m14.0s), 210/210 VUs, 346 complete and 0 interrupted iterations
crud      [   2% ] 158 VUs  0m02.6s/2m0s
listing   [   2% ] 52 VUs   0m02.6s/2m0s

running (0m15.0s), 210/210 VUs, 470 complete and 0 interrupted iterations
crud      [   3% ] 158 VUs  0m03.6s/2m0s
listing   [   3% ] 52 VUs   0m03.6s/2m0s

running (0m16.0s), 210/210 VUs, 574 complete and 0 interrupted iterations
crud      [   4% ] 158 VUs  0m04.6s/2m0s
listing   [   4% ] 52 VUs   0m04.6s/2m0s

running (0m17.0s), 210/210 VUs, 836 complete and 0 interrupted iterations
crud      [   5% ] 158 VUs  0m05.6s/2m0s
listing   [   5% ] 52 VUs   0m05.6s/2m0s

running (0m18.0s), 210/210 VUs, 940 complete and 0 interrupted iterations
crud      [   5% ] 158 VUs  0m06.6s/2m0s
listing   [   5% ] 52 VUs   0m06.6s/2m0s

running (0m19.0s), 210/210 VUs, 1202 complete and 0 interrupted iterations
crud      [   6% ] 158 VUs  0m07.6s/2m0s
listing   [   6% ] 52 VUs   0m07.6s/2m0s

running (0m20.0s), 210/210 VUs, 1306 complete and 0 interrupted iterations
crud      [   7% ] 158 VUs  0m08.6s/2m0s
listing   [   7% ] 52 VUs   0m08.6s/2m0s

running (0m21.0s), 210/210 VUs, 1568 complete and 0 interrupted iterations
crud      [   8% ] 158 VUs  0m09.6s/2m0s
listing   [   8% ] 52 VUs   0m09.6s/2m0s

running (0m22.0s), 210/210 VUs, 1672 complete and 0 interrupted iterations
crud      [   9% ] 158 VUs  0m10.6s/2m0s
listing   [   9% ] 52 VUs   0m10.6s/2m0s

running (0m23.0s), 210/210 VUs, 1839 complete and 0 interrupted iterations
crud      [  10% ] 158 VUs  0m11.6s/2m0s
listing   [  10% ] 52 VUs   0m11.6s/2m0s

running (0m24.0s), 210/210 VUs, 2038 complete and 0 interrupted iterations
crud      [  10% ] 158 VUs  0m12.6s/2m0s
listing   [  10% ] 52 VUs   0m12.6s/2m0s

running (0m25.0s), 210/210 VUs, 2142 complete and 0 interrupted iterations
crud      [  11% ] 158 VUs  0m13.6s/2m0s
listing   [  11% ] 52 VUs   0m13.6s/2m0s

running (0m26.0s), 210/210 VUs, 2404 complete and 0 interrupted iterations
crud      [  12% ] 158 VUs  0m14.6s/2m0s
listing   [  12% ] 52 VUs   0m14.6s/2m0s

running (0m27.0s), 210/210 VUs, 2496 complete and 0 interrupted iterations
crud      [  13% ] 158 VUs  0m15.6s/2m0s
listing   [  13% ] 52 VUs   0m15.6s/2m0s

running (0m28.0s), 210/210 VUs, 2758 complete and 0 interrupted iterations
crud      [  14% ] 158 VUs  0m16.6s/2m0s
listing   [  14% ] 52 VUs   0m16.6s/2m0s

running (0m29.0s), 210/210 VUs, 2859 complete and 0 interrupted iterations
crud      [  15% ] 158 VUs  0m17.6s/2m0s
listing   [  15% ] 52 VUs   0m17.6s/2m0s

running (0m30.0s), 210/210 VUs, 3102 complete and 0 interrupted iterations
crud      [  15% ] 158 VUs  0m18.6s/2m0s
listing   [  15% ] 52 VUs   0m18.6s/2m0s

running (0m31.0s), 210/210 VUs, 3208 complete and 0 interrupted iterations
crud      [  16% ] 158 VUs  0m19.6s/2m0s
listing   [  16% ] 52 VUs   0m19.6s/2m0s

running (0m32.0s), 210/210 VUs, 3320 complete and 0 interrupted iterations
crud      [  17% ] 158 VUs  0m20.6s/2m0s
listing   [  17% ] 52 VUs   0m20.6s/2m0s

running (0m33.0s), 210/210 VUs, 3568 complete and 0 interrupted iterations
crud      [  18% ] 158 VUs  0m21.6s/2m0s
listing   [  18% ] 52 VUs   0m21.6s/2m0s

running (0m34.0s), 210/210 VUs, 3671 complete and 0 interrupted iterations
crud      [  19% ] 158 VUs  0m22.6s/2m0s
listing   [  19% ] 52 VUs   0m22.6s/2m0s

running (0m35.0s), 210/210 VUs, 3925 complete and 0 interrupted iterations
crud      [  20% ] 158 VUs  0m23.6s/2m0s
listing   [  20% ] 52 VUs   0m23.6s/2m0s

running (0m36.0s), 210/210 VUs, 4029 complete and 0 interrupted iterations
crud      [  20% ] 158 VUs  0m24.6s/2m0s
listing   [  20% ] 52 VUs   0m24.6s/2m0s

running (0m37.0s), 210/210 VUs, 4288 complete and 0 interrupted iterations
crud      [  21% ] 158 VUs  0m25.6s/2m0s
listing   [  21% ] 52 VUs   0m25.6s/2m0s

running (0m38.0s), 210/210 VUs, 4390 complete and 0 interrupted iterations
crud      [  22% ] 158 VUs  0m26.6s/2m0s
listing   [  22% ] 52 VUs   0m26.6s/2m0s

running (0m39.0s), 210/210 VUs, 4557 complete and 0 interrupted iterations
crud      [  23% ] 158 VUs  0m27.6s/2m0s
listing   [  23% ] 52 VUs   0m27.6s/2m0s

running (0m40.0s), 210/210 VUs, 4756 complete and 0 interrupted iterations
crud      [  24% ] 158 VUs  0m28.6s/2m0s
listing   [  24% ] 52 VUs   0m28.6s/2m0s

running (0m41.0s), 210/210 VUs, 4861 complete and 0 interrupted iterations
crud      [  25% ] 158 VUs  0m29.6s/2m0s
listing   [  25% ] 52 VUs   0m29.6s/2m0s

running (0m42.0s), 210/210 VUs, 5122 complete and 0 interrupted iterations
crud      [  25% ] 158 VUs  0m30.6s/2m0s
listing   [  25% ] 52 VUs   0m30.6s/2m0s

running (0m43.0s), 210/210 VUs, 5226 complete and 0 interrupted iterations
crud      [  26% ] 158 VUs  0m31.6s/2m0s
listing   [  26% ] 52 VUs   0m31.6s/2m0s

running (0m44.0s), 210/210 VUs, 5488 complete and 0 interrupted iterations
crud      [  27% ] 158 VUs  0m32.6s/2m0s
listing   [  27% ] 52 VUs   0m32.6s/2m0s

running (0m45.0s), 210/210 VUs, 5592 complete and 0 interrupted iterations
crud      [  28% ] 158 VUs  0m33.6s/2m0s
listing   [  28% ] 52 VUs   0m33.6s/2m0s

running (0m46.0s), 210/210 VUs, 5837 complete and 0 interrupted iterations
crud      [  29% ] 158 VUs  0m34.6s/2m0s
listing   [  29% ] 52 VUs   0m34.6s/2m0s

running (0m47.0s), 210/210 VUs, 5958 complete and 0 interrupted iterations
crud      [  30% ] 158 VUs  0m35.6s/2m0s
listing   [  30% ] 52 VUs   0m35.6s/2m0s

running (0m48.0s), 210/210 VUs, 6070 complete and 0 interrupted iterations
crud      [  30% ] 158 VUs  0m36.6s/2m0s
listing   [  30% ] 52 VUs   0m36.6s/2m0s

running (0m49.0s), 210/210 VUs, 6313 complete and 0 interrupted iterations
crud      [  31% ] 158 VUs  0m37.6s/2m0s
listing   [  31% ] 52 VUs   0m37.6s/2m0s

running (0m50.0s), 210/210 VUs, 6412 complete and 0 interrupted iterations
crud      [  32% ] 158 VUs  0m38.6s/2m0s
listing   [  32% ] 52 VUs   0m38.6s/2m0s

running (0m51.0s), 210/210 VUs, 6674 complete and 0 interrupted iterations
crud      [  33% ] 158 VUs  0m39.6s/2m0s
listing   [  33% ] 52 VUs   0m39.6s/2m0s
time="2026-05-28T17:51:06-03:00" level=warning msg="The test has generated metrics with 100165 unique time series, which is higher than the suggested limit of 100000 and could cause high memory usage. Consider not using high-cardinality values like unique IDs as metric tags or, if you need them in the URL, use the name metric tag or URL grouping. See https://grafana.com/docs/k6/latest/using-k6/tags-and-groups/ for details." component=metrics-engine-ingester

running (0m52.0s), 210/210 VUs, 6774 complete and 0 interrupted iterations
crud      [  34% ] 158 VUs  0m40.6s/2m0s
listing   [  34% ] 52 VUs   0m40.6s/2m0s

running (0m53.0s), 210/210 VUs, 7034 complete and 0 interrupted iterations
crud      [  35% ] 158 VUs  0m41.6s/2m0s
listing   [  35% ] 52 VUs   0m41.6s/2m0s

running (0m54.0s), 210/210 VUs, 7131 complete and 0 interrupted iterations
crud      [  35% ] 158 VUs  0m42.6s/2m0s
listing   [  35% ] 52 VUs   0m42.6s/2m0s

running (0m55.0s), 210/210 VUs, 7311 complete and 0 interrupted iterations
crud      [  36% ] 158 VUs  0m43.6s/2m0s
listing   [  36% ] 52 VUs   0m43.6s/2m0s

running (0m56.0s), 210/210 VUs, 7487 complete and 0 interrupted iterations
crud      [  37% ] 158 VUs  0m44.6s/2m0s
listing   [  37% ] 52 VUs   0m44.6s/2m0s

running (0m57.0s), 210/210 VUs, 7597 complete and 0 interrupted iterations
crud      [  38% ] 158 VUs  0m45.6s/2m0s
listing   [  38% ] 52 VUs   0m45.6s/2m0s

running (0m58.0s), 210/210 VUs, 7853 complete and 0 interrupted iterations
crud      [  39% ] 158 VUs  0m46.6s/2m0s
listing   [  39% ] 52 VUs   0m46.6s/2m0s

running (0m59.0s), 210/210 VUs, 7957 complete and 0 interrupted iterations
crud      [  40% ] 158 VUs  0m47.6s/2m0s
listing   [  40% ] 52 VUs   0m47.6s/2m0s

running (1m00.0s), 210/210 VUs, 8216 complete and 0 interrupted iterations
crud      [  40% ] 158 VUs  0m48.6s/2m0s
listing   [  40% ] 52 VUs   0m48.6s/2m0s

running (1m01.0s), 210/210 VUs, 8320 complete and 0 interrupted iterations
crud      [  41% ] 158 VUs  0m49.6s/2m0s
listing   [  41% ] 52 VUs   0m49.6s/2m0s

running (1m02.0s), 210/210 VUs, 8562 complete and 0 interrupted iterations
crud      [  42% ] 158 VUs  0m50.6s/2m0s
listing   [  42% ] 52 VUs   0m50.6s/2m0s

running (1m03.0s), 210/210 VUs, 8676 complete and 0 interrupted iterations
crud      [  43% ] 158 VUs  0m51.6s/2m0s
listing   [  43% ] 52 VUs   0m51.6s/2m0s

running (1m04.0s), 210/210 VUs, 8795 complete and 0 interrupted iterations
crud      [  44% ] 158 VUs  0m52.6s/2m0s
listing   [  44% ] 52 VUs   0m52.6s/2m0s

running (1m05.0s), 210/210 VUs, 9042 complete and 0 interrupted iterations
crud      [  45% ] 158 VUs  0m53.6s/2m0s
listing   [  45% ] 52 VUs   0m53.6s/2m0s

running (1m06.0s), 210/210 VUs, 9148 complete and 0 interrupted iterations
crud      [  45% ] 158 VUs  0m54.6s/2m0s
listing   [  45% ] 52 VUs   0m54.6s/2m0s

running (1m07.0s), 210/210 VUs, 9408 complete and 0 interrupted iterations
crud      [  46% ] 158 VUs  0m55.6s/2m0s
listing   [  46% ] 52 VUs   0m55.6s/2m0s

running (1m08.0s), 210/210 VUs, 9494 complete and 0 interrupted iterations
crud      [  47% ] 158 VUs  0m56.6s/2m0s
listing   [  47% ] 52 VUs   0m56.6s/2m0s

running (1m09.0s), 210/210 VUs, 9740 complete and 0 interrupted iterations
crud      [  48% ] 158 VUs  0m57.6s/2m0s
listing   [  48% ] 52 VUs   0m57.6s/2m0s

running (1m10.0s), 210/210 VUs, 9852 complete and 0 interrupted iterations
crud      [  49% ] 158 VUs  0m58.6s/2m0s
listing   [  49% ] 52 VUs   0m58.6s/2m0s

running (1m11.0s), 210/210 VUs, 9975 complete and 0 interrupted iterations
crud      [  50% ] 158 VUs  0m59.6s/2m0s
listing   [  50% ] 52 VUs   0m59.6s/2m0s

running (1m12.0s), 210/210 VUs, 10218 complete and 0 interrupted iterations
crud      [  50% ] 158 VUs  1m00.6s/2m0s
listing   [  50% ] 52 VUs   1m00.6s/2m0s

running (1m13.0s), 210/210 VUs, 10325 complete and 0 interrupted iterations
crud      [  51% ] 158 VUs  1m01.6s/2m0s
listing   [  51% ] 52 VUs   1m01.6s/2m0s

running (1m14.0s), 210/210 VUs, 10584 complete and 0 interrupted iterations
crud      [  52% ] 158 VUs  1m02.6s/2m0s
listing   [  52% ] 52 VUs   1m02.6s/2m0s

running (1m15.0s), 210/210 VUs, 10688 complete and 0 interrupted iterations
crud      [  53% ] 158 VUs  1m03.6s/2m0s
listing   [  53% ] 52 VUs   1m03.6s/2m0s

running (1m16.0s), 210/210 VUs, 10949 complete and 0 interrupted iterations
crud      [  54% ] 158 VUs  1m04.6s/2m0s
listing   [  54% ] 52 VUs   1m04.6s/2m0s

running (1m17.0s), 210/210 VUs, 11053 complete and 0 interrupted iterations
crud      [  55% ] 158 VUs  1m05.6s/2m0s
listing   [  55% ] 52 VUs   1m05.6s/2m0s

running (1m18.0s), 210/210 VUs, 11198 complete and 0 interrupted iterations
crud      [  55% ] 158 VUs  1m06.6s/2m0s
listing   [  55% ] 52 VUs   1m06.6s/2m0s

running (1m19.0s), 210/210 VUs, 11409 complete and 0 interrupted iterations
crud      [  56% ] 158 VUs  1m07.6s/2m0s
listing   [  56% ] 52 VUs   1m07.6s/2m0s

running (1m20.0s), 210/210 VUs, 11523 complete and 0 interrupted iterations
crud      [  57% ] 158 VUs  1m08.6s/2m0s
listing   [  57% ] 52 VUs   1m08.6s/2m0s

running (1m21.0s), 210/210 VUs, 11775 complete and 0 interrupted iterations
crud      [  58% ] 158 VUs  1m09.6s/2m0s
listing   [  58% ] 52 VUs   1m09.6s/2m0s

running (1m22.0s), 210/210 VUs, 11880 complete and 0 interrupted iterations
crud      [  59% ] 158 VUs  1m10.6s/2m0s
listing   [  59% ] 52 VUs   1m10.6s/2m0s

running (1m23.0s), 210/210 VUs, 12140 complete and 0 interrupted iterations
crud      [  60% ] 158 VUs  1m11.6s/2m0s
listing   [  60% ] 52 VUs   1m11.6s/2m0s

running (1m24.0s), 210/210 VUs, 12237 complete and 0 interrupted iterations
crud      [  60% ] 158 VUs  1m12.6s/2m0s
listing   [  60% ] 52 VUs   1m12.6s/2m0s

running (1m25.0s), 210/210 VUs, 12454 complete and 0 interrupted iterations
crud      [  61% ] 158 VUs  1m13.6s/2m0s
listing   [  61% ] 52 VUs   1m13.6s/2m0s

running (1m26.0s), 210/210 VUs, 12600 complete and 0 interrupted iterations
crud      [  62% ] 158 VUs  1m14.6s/2m0s
listing   [  62% ] 52 VUs   1m14.6s/2m0s

running (1m27.0s), 210/210 VUs, 12724 complete and 0 interrupted iterations
crud      [  63% ] 158 VUs  1m15.6s/2m0s
listing   [  63% ] 52 VUs   1m15.6s/2m0s

running (1m28.0s), 210/210 VUs, 12948 complete and 0 interrupted iterations
crud      [  64% ] 158 VUs  1m16.6s/2m0s
listing   [  64% ] 52 VUs   1m16.6s/2m0s

running (1m29.0s), 210/210 VUs, 13052 complete and 0 interrupted iterations
crud      [  65% ] 158 VUs  1m17.6s/2m0s
listing   [  65% ] 52 VUs   1m17.6s/2m0s

running (1m30.0s), 210/210 VUs, 13309 complete and 0 interrupted iterations
crud      [  65% ] 158 VUs  1m18.6s/2m0s
listing   [  65% ] 52 VUs   1m18.6s/2m0s

running (1m31.0s), 210/210 VUs, 13409 complete and 0 interrupted iterations
crud      [  66% ] 158 VUs  1m19.6s/2m0s
listing   [  66% ] 52 VUs   1m19.6s/2m0s

running (1m32.0s), 210/210 VUs, 13639 complete and 0 interrupted iterations
crud      [  67% ] 158 VUs  1m20.6s/2m0s
listing   [  67% ] 52 VUs   1m20.6s/2m0s
time="2026-05-28T17:51:47-03:00" level=warning msg="The test has generated metrics with 200290 unique time series, which is higher than the suggested limit of 100000 and could cause high memory usage. Consider not using high-cardinality values like unique IDs as metric tags or, if you need them in the URL, use the name metric tag or URL grouping. See https://grafana.com/docs/k6/latest/using-k6/tags-and-groups/ for details." component=metrics-engine-ingester

running (1m33.0s), 210/210 VUs, 13774 complete and 0 interrupted iterations
crud      [  68% ] 158 VUs  1m21.6s/2m0s
listing   [  68% ] 52 VUs   1m21.6s/2m0s

running (1m34.0s), 210/210 VUs, 13900 complete and 0 interrupted iterations
crud      [  69% ] 158 VUs  1m22.6s/2m0s
listing   [  69% ] 52 VUs   1m22.6s/2m0s

running (1m35.0s), 210/210 VUs, 14140 complete and 0 interrupted iterations
crud      [  70% ] 158 VUs  1m23.6s/2m0s
listing   [  70% ] 52 VUs   1m23.6s/2m0s

running (1m36.0s), 210/210 VUs, 14253 complete and 0 interrupted iterations
crud      [  70% ] 158 VUs  1m24.6s/2m0s
listing   [  70% ] 52 VUs   1m24.6s/2m0s

running (1m37.0s), 210/210 VUs, 14504 complete and 0 interrupted iterations
crud      [  71% ] 158 VUs  1m25.6s/2m0s
listing   [  71% ] 52 VUs   1m25.6s/2m0s

running (1m38.0s), 210/210 VUs, 14609 complete and 0 interrupted iterations
crud      [  72% ] 158 VUs  1m26.6s/2m0s
listing   [  72% ] 52 VUs   1m26.6s/2m0s

running (1m39.0s), 210/210 VUs, 14866 complete and 0 interrupted iterations
crud      [  73% ] 158 VUs  1m27.6s/2m0s
listing   [  73% ] 52 VUs   1m27.6s/2m0s

running (1m40.0s), 210/210 VUs, 14964 complete and 0 interrupted iterations
crud      [  74% ] 158 VUs  1m28.6s/2m0s
listing   [  74% ] 52 VUs   1m28.6s/2m0s

running (1m41.0s), 210/210 VUs, 15131 complete and 0 interrupted iterations
crud      [  75% ] 158 VUs  1m29.6s/2m0s
listing   [  75% ] 52 VUs   1m29.6s/2m0s

running (1m42.0s), 210/210 VUs, 15325 complete and 0 interrupted iterations
crud      [  75% ] 158 VUs  1m30.6s/2m0s
listing   [  75% ] 52 VUs   1m30.6s/2m0s

running (1m43.0s), 210/210 VUs, 15450 complete and 0 interrupted iterations
crud      [  76% ] 158 VUs  1m31.6s/2m0s
listing   [  76% ] 52 VUs   1m31.6s/2m0s

running (1m44.0s), 210/210 VUs, 15679 complete and 0 interrupted iterations
crud      [  77% ] 158 VUs  1m32.6s/2m0s
listing   [  77% ] 52 VUs   1m32.6s/2m0s

running (1m45.0s), 210/210 VUs, 15785 complete and 0 interrupted iterations
crud      [  78% ] 158 VUs  1m33.6s/2m0s
listing   [  78% ] 52 VUs   1m33.6s/2m0s

running (1m46.0s), 210/210 VUs, 16036 complete and 0 interrupted iterations
crud      [  79% ] 158 VUs  1m34.6s/2m0s
listing   [  79% ] 52 VUs   1m34.6s/2m0s

running (1m47.0s), 210/210 VUs, 16142 complete and 0 interrupted iterations
crud      [  80% ] 158 VUs  1m35.6s/2m0s
listing   [  80% ] 52 VUs   1m35.6s/2m0s

running (1m48.0s), 210/210 VUs, 16369 complete and 0 interrupted iterations
crud      [  80% ] 158 VUs  1m36.6s/2m0s
listing   [  80% ] 52 VUs   1m36.6s/2m0s

running (1m49.0s), 210/210 VUs, 16501 complete and 0 interrupted iterations
crud      [  81% ] 158 VUs  1m37.6s/2m0s
listing   [  81% ] 52 VUs   1m37.6s/2m0s

running (1m50.0s), 210/210 VUs, 16642 complete and 0 interrupted iterations
crud      [  82% ] 158 VUs  1m38.6s/2m0s
listing   [  82% ] 52 VUs   1m38.6s/2m0s

running (1m51.0s), 210/210 VUs, 16867 complete and 0 interrupted iterations
crud      [  83% ] 158 VUs  1m39.6s/2m0s
listing   [  83% ] 52 VUs   1m39.6s/2m0s

running (1m52.0s), 210/210 VUs, 16985 complete and 0 interrupted iterations
crud      [  84% ] 158 VUs  1m40.6s/2m0s
listing   [  84% ] 52 VUs   1m40.6s/2m0s

running (1m53.0s), 210/210 VUs, 17233 complete and 0 interrupted iterations
crud      [  85% ] 158 VUs  1m41.6s/2m0s
listing   [  85% ] 52 VUs   1m41.6s/2m0s

running (1m54.0s), 210/210 VUs, 17340 complete and 0 interrupted iterations
crud      [  85% ] 158 VUs  1m42.6s/2m0s
listing   [  85% ] 52 VUs   1m42.6s/2m0s

running (1m55.0s), 210/210 VUs, 17597 complete and 0 interrupted iterations
crud      [  86% ] 158 VUs  1m43.6s/2m0s
listing   [  86% ] 52 VUs   1m43.6s/2m0s

running (1m56.0s), 210/210 VUs, 17703 complete and 0 interrupted iterations
crud      [  87% ] 158 VUs  1m44.6s/2m0s
listing   [  87% ] 52 VUs   1m44.6s/2m0s

running (1m57.0s), 210/210 VUs, 17891 complete and 0 interrupted iterations
crud      [  88% ] 158 VUs  1m45.6s/2m0s
listing   [  88% ] 52 VUs   1m45.6s/2m0s

running (1m58.0s), 210/210 VUs, 18063 complete and 0 interrupted iterations
crud      [  89% ] 158 VUs  1m46.6s/2m0s
listing   [  89% ] 52 VUs   1m46.6s/2m0s

running (1m59.0s), 210/210 VUs, 18190 complete and 0 interrupted iterations
crud      [  90% ] 158 VUs  1m47.6s/2m0s
listing   [  90% ] 52 VUs   1m47.6s/2m0s

running (2m00.0s), 210/210 VUs, 18427 complete and 0 interrupted iterations
crud      [  90% ] 158 VUs  1m48.6s/2m0s
listing   [  90% ] 52 VUs   1m48.6s/2m0s

running (2m01.0s), 210/210 VUs, 18541 complete and 0 interrupted iterations
crud      [  91% ] 158 VUs  1m49.6s/2m0s
listing   [  91% ] 52 VUs   1m49.6s/2m0s

running (2m02.0s), 210/210 VUs, 18793 complete and 0 interrupted iterations
crud      [  92% ] 158 VUs  1m50.6s/2m0s
listing   [  92% ] 52 VUs   1m50.6s/2m0s

running (2m03.0s), 210/210 VUs, 18893 complete and 0 interrupted iterations
crud      [  93% ] 158 VUs  1m51.6s/2m0s
listing   [  93% ] 52 VUs   1m51.6s/2m0s

running (2m04.0s), 210/210 VUs, 19143 complete and 0 interrupted iterations
crud      [  94% ] 158 VUs  1m52.6s/2m0s
listing   [  94% ] 52 VUs   1m52.6s/2m0s

running (2m05.0s), 210/210 VUs, 19254 complete and 0 interrupted iterations
crud      [  95% ] 158 VUs  1m53.6s/2m0s
listing   [  95% ] 52 VUs   1m53.6s/2m0s

running (2m06.0s), 210/210 VUs, 19405 complete and 0 interrupted iterations
crud      [  95% ] 158 VUs  1m54.6s/2m0s
listing   [  95% ] 52 VUs   1m54.6s/2m0s

running (2m07.0s), 210/210 VUs, 19608 complete and 0 interrupted iterations
crud      [  96% ] 158 VUs  1m55.6s/2m0s
listing   [  96% ] 52 VUs   1m55.6s/2m0s

running (2m08.0s), 210/210 VUs, 19731 complete and 0 interrupted iterations
crud      [  97% ] 158 VUs  1m56.6s/2m0s
listing   [  97% ] 52 VUs   1m56.6s/2m0s

running (2m09.0s), 210/210 VUs, 19959 complete and 0 interrupted iterations
crud      [  98% ] 158 VUs  1m57.6s/2m0s
listing   [  98% ] 52 VUs   1m57.6s/2m0s

running (2m10.0s), 210/210 VUs, 20072 complete and 0 interrupted iterations
crud      [  99% ] 158 VUs  1m58.6s/2m0s
listing   [  99% ] 52 VUs   1m58.6s/2m0s

running (2m11.0s), 210/210 VUs, 20321 complete and 0 interrupted iterations
crud      [ 100% ] 158 VUs  1m59.6s/2m0s
listing   [ 100% ] 52 VUs   1m59.6s/2m0s

running (2m12.0s), 155/210 VUs, 20424 complete and 0 interrupted iterations
crud    ↓ [ 100% ] 158 VUs  2m0s
listing ✓ [ 100% ] 52 VUs   2m0s

running (2m13.0s), 047/210 VUs, 20532 complete and 0 interrupted iterations
crud    ↓ [ 100% ] 158 VUs  2m0s
listing ✓ [ 100% ] 52 VUs   2m0s


  █ THRESHOLDS 

    http_req_duration
    ✓ 'p(95)<1000' p(95)=30.71ms

      {scenario:crud}
      ✓ 'p(95)<1500' p(95)=32.57ms

      {scenario:listing}
      ✓ 'p(95)<600' p(95)=21.51ms

    http_req_failed
    ✓ 'rate<0.01' rate=0.00%


  █ TOTAL RESULTS 

    checks_total.......: 75114   564.195989/s
    checks_succeeded...: 100.00% 75114 out of 75114
    checks_failed......: 0.00%   0 out of 75114

    ✓ register 201
    ✓ login 200
    ✓ list 200
    ✓ list tem content
    ✓ create 201
    ✓ create retorna id
    ✓ get 200
    ✓ like 200
    ✓ update 200
    ✓ delete 204

    HTTP
    http_req_duration..............: avg=16.57ms min=3.3ms    med=14.07ms  max=266.53ms p(90)=24.76ms p(95)=30.71ms
      { expected_response:true }...: avg=16.57ms min=3.3ms    med=14.07ms  max=266.53ms p(90)=24.76ms p(95)=30.71ms
      { scenario:crud }............: avg=17.89ms min=3.78ms   med=15.46ms  max=266.53ms p(90)=25.84ms p(95)=32.57ms
      { scenario:listing }.........: avg=11.71ms min=3.3ms    med=9.4ms    max=256.4ms  p(90)=16.42ms p(95)=21.51ms
    http_req_failed................: 0.00% 0 out of 54535
    http_reqs......................: 54535 409.623083/s

    EXECUTION
    iteration_duration.............: avg=1.23s   min=503.47ms med=514.22ms max=2.58s    p(90)=2.29s   p(95)=2.31s  
    iterations.....................: 20579 154.572906/s
    vus............................: 47    min=0          max=210
    vus_max........................: 210   min=210        max=210

    NETWORK
    data_received..................: 29 MB 214 kB/s
    data_sent......................: 26 MB 191 kB/s




running (2m13.1s), 000/210 VUs, 20579 complete and 0 interrupted iterations
crud    ✓ [ 100% ] 158 VUs  2m0s
listing ✓ [ 100% ] 52 VUs   2m0s

================================================================
% cd DomainFeed/post && k6 run post-spike.js
================================================================


         /\      Grafana   /‾‾/  
    /\  /  \     |\  __   /  /   
   /  \/    \    | |/ /  /   ‾‾\ 
  /          \   |   (  |  (‾)  |
 / __________ \  |_|\_\  \_____/ 


     execution: local
        script: post-spike.js
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
time="2026-05-28T17:52:53-03:00" level=info msg="Setup concluído: 500 usuários prontos." source=console

running (0m25.0s), 005/500 VUs, 0 complete and 0 interrupted iterations
default   [   1% ] 005/500 VUs  00.7s/50.0s

running (0m26.0s), 012/500 VUs, 9 complete and 0 interrupted iterations
default   [   3% ] 012/500 VUs  01.7s/50.0s

running (0m27.0s), 019/500 VUs, 27 complete and 0 interrupted iterations
default   [   5% ] 019/500 VUs  02.7s/50.0s

running (0m28.0s), 026/500 VUs, 55 complete and 0 interrupted iterations
default   [   7% ] 026/500 VUs  03.7s/50.0s

running (0m29.0s), 033/500 VUs, 92 complete and 0 interrupted iterations
default   [   9% ] 033/500 VUs  04.7s/50.0s

running (0m30.0s), 040/500 VUs, 139 complete and 0 interrupted iterations
default   [  11% ] 040/500 VUs  05.7s/50.0s

running (0m31.0s), 047/500 VUs, 196 complete and 0 interrupted iterations
default   [  13% ] 047/500 VUs  06.7s/50.0s

running (0m32.0s), 054/500 VUs, 260 complete and 0 interrupted iterations
default   [  15% ] 054/500 VUs  07.7s/50.0s

running (0m33.0s), 061/500 VUs, 331 complete and 0 interrupted iterations
default   [  17% ] 061/500 VUs  08.7s/50.0s

running (0m34.0s), 068/500 VUs, 416 complete and 0 interrupted iterations
default   [  19% ] 068/500 VUs  09.7s/50.0s

running (0m35.0s), 131/500 VUs, 511 complete and 0 interrupted iterations
default   [  21% ] 131/500 VUs  10.7s/50.0s

running (0m36.0s), 217/500 VUs, 705 complete and 0 interrupted iterations
default   [  23% ] 217/500 VUs  11.7s/50.0s

running (0m37.0s), 303/500 VUs, 979 complete and 0 interrupted iterations
default   [  25% ] 303/500 VUs  12.7s/50.0s

running (0m38.0s), 389/500 VUs, 1276 complete and 0 interrupted iterations
default   [  27% ] 389/500 VUs  13.7s/50.0s

running (0m39.0s), 475/500 VUs, 1619 complete and 0 interrupted iterations
default   [  29% ] 475/500 VUs  14.7s/50.0s

running (0m40.0s), 500/500 VUs, 1929 complete and 0 interrupted iterations
default   [  31% ] 500/500 VUs  15.7s/50.0s

running (0m41.0s), 500/500 VUs, 2266 complete and 0 interrupted iterations
default   [  33% ] 500/500 VUs  16.7s/50.0s

running (0m42.0s), 500/500 VUs, 2592 complete and 0 interrupted iterations
default   [  35% ] 500/500 VUs  17.7s/50.0s

running (0m43.0s), 500/500 VUs, 2957 complete and 0 interrupted iterations
default   [  37% ] 500/500 VUs  18.7s/50.0s

running (0m44.0s), 500/500 VUs, 3290 complete and 0 interrupted iterations
default   [  39% ] 500/500 VUs  19.7s/50.0s

running (0m45.0s), 500/500 VUs, 3605 complete and 0 interrupted iterations
default   [  41% ] 500/500 VUs  20.7s/50.0s

running (0m46.0s), 500/500 VUs, 3968 complete and 0 interrupted iterations
default   [  43% ] 500/500 VUs  21.7s/50.0s

running (0m47.0s), 500/500 VUs, 4317 complete and 0 interrupted iterations
default   [  45% ] 500/500 VUs  22.7s/50.0s

running (0m48.0s), 500/500 VUs, 4687 complete and 0 interrupted iterations
default   [  47% ] 500/500 VUs  23.7s/50.0s

running (0m49.0s), 500/500 VUs, 5039 complete and 0 interrupted iterations
default   [  49% ] 500/500 VUs  24.7s/50.0s

running (0m50.0s), 500/500 VUs, 5373 complete and 0 interrupted iterations
default   [  51% ] 500/500 VUs  25.7s/50.0s

running (0m51.0s), 500/500 VUs, 5719 complete and 0 interrupted iterations
default   [  53% ] 500/500 VUs  26.7s/50.0s

running (0m52.0s), 500/500 VUs, 6052 complete and 0 interrupted iterations
default   [  55% ] 500/500 VUs  27.7s/50.0s

running (0m53.0s), 500/500 VUs, 6391 complete and 0 interrupted iterations
default   [  57% ] 500/500 VUs  28.7s/50.0s

running (0m54.0s), 500/500 VUs, 6713 complete and 0 interrupted iterations
default   [  59% ] 500/500 VUs  29.7s/50.0s

running (0m55.0s), 500/500 VUs, 7078 complete and 0 interrupted iterations
default   [  61% ] 500/500 VUs  30.7s/50.0s

running (0m56.0s), 500/500 VUs, 7406 complete and 0 interrupted iterations
default   [  63% ] 500/500 VUs  31.7s/50.0s

running (0m57.0s), 500/500 VUs, 7771 complete and 0 interrupted iterations
default   [  65% ] 500/500 VUs  32.7s/50.0s

running (0m58.0s), 500/500 VUs, 8135 complete and 0 interrupted iterations
default   [  67% ] 500/500 VUs  33.7s/50.0s

running (0m59.0s), 500/500 VUs, 8430 complete and 0 interrupted iterations
default   [  69% ] 500/500 VUs  34.7s/50.0s

running (1m00.0s), 486/500 VUs, 8761 complete and 0 interrupted iterations
default   [  71% ] 486/500 VUs  35.7s/50.0s

running (1m01.0s), 426/500 VUs, 9033 complete and 0 interrupted iterations
default   [  73% ] 426/500 VUs  36.7s/50.0s

running (1m02.0s), 308/500 VUs, 9422 complete and 0 interrupted iterations
default   [  75% ] 308/500 VUs  37.7s/50.0s

running (1m03.0s), 209/500 VUs, 9771 complete and 0 interrupted iterations
default   [  77% ] 209/500 VUs  38.7s/50.0s

running (1m04.0s), 127/500 VUs, 10036 complete and 0 interrupted iterations
default   [  79% ] 127/500 VUs  39.7s/50.0s

running (1m05.0s), 067/500 VUs, 10192 complete and 0 interrupted iterations
default   [  81% ] 067/500 VUs  40.7s/50.0s

running (1m06.0s), 061/500 VUs, 10286 complete and 0 interrupted iterations
default   [  83% ] 061/500 VUs  41.7s/50.0s

running (1m07.0s), 052/500 VUs, 10362 complete and 0 interrupted iterations
default   [  85% ] 052/500 VUs  42.7s/50.0s

running (1m08.0s), 050/500 VUs, 10436 complete and 0 interrupted iterations
default   [  87% ] 050/500 VUs  43.7s/50.0s

running (1m09.0s), 040/500 VUs, 10502 complete and 0 interrupted iterations
default   [  89% ] 040/500 VUs  44.7s/50.0s

running (1m10.0s), 034/500 VUs, 10552 complete and 0 interrupted iterations
default   [  91% ] 034/500 VUs  45.7s/50.0s
time="2026-05-28T17:53:39-03:00" level=warning msg="The test has generated metrics with 100003 unique time series, which is higher than the suggested limit of 100000 and could cause high memory usage. Consider not using high-cardinality values like unique IDs as metric tags or, if you need them in the URL, use the name metric tag or URL grouping. See https://grafana.com/docs/k6/latest/using-k6/tags-and-groups/ for details." component=metrics-engine-ingester

running (1m11.0s), 027/500 VUs, 10600 complete and 0 interrupted iterations
default   [  93% ] 027/500 VUs  46.7s/50.0s

running (1m12.0s), 020/500 VUs, 10633 complete and 0 interrupted iterations
default   [  95% ] 020/500 VUs  47.7s/50.0s

running (1m13.0s), 013/500 VUs, 10659 complete and 0 interrupted iterations
default   [  97% ] 013/500 VUs  48.7s/50.0s

running (1m14.0s), 004/500 VUs, 10677 complete and 0 interrupted iterations
default   [  99% ] 004/500 VUs  49.7s/50.0s


  █ THRESHOLDS 

    http_req_duration
    ✓ 'p(95)<1500' p(95)=352.1ms

    http_req_failed
    ✓ 'rate<0.05' rate=0.00%


  █ TOTAL RESULTS 

    checks_total.......: 33046   441.874916/s
    checks_succeeded...: 100.00% 33046 out of 33046
    checks_failed......: 0.00%   0 out of 33046

    ✓ register 201
    ✓ login 200
    ✓ list 200
    ✓ list tem content
    ✓ create 201 ou 429

    HTTP
    http_req_duration..............: avg=192.27ms min=3.47ms   med=230.97ms max=769ms p(90)=315.22ms p(95)=352.1ms
      { expected_response:true }...: avg=192.27ms min=3.47ms   med=230.97ms max=769ms p(90)=315.22ms p(95)=352.1ms
    http_req_failed................: 0.00% 0 out of 33046
    http_reqs......................: 33046 441.874916/s

    EXECUTION
    iteration_duration.............: avg=1.29s    min=719.89ms med=1.4s     max=2.14s p(90)=1.61s    p(95)=1.65s  
    iterations.....................: 10682 142.834469/s
    vus............................: 4     min=0          max=500
    vus_max........................: 500   min=500        max=500

    NETWORK
    data_received..................: 16 MB 217 kB/s
    data_sent......................: 15 MB 201 kB/s




running (1m14.8s), 000/500 VUs, 10682 complete and 0 interrupted iterations
default ✓ [ 100% ] 000/500 VUs  50s

================================================================
% cd DomainFeed/post && k6 run post-stress.js
================================================================


         /\      Grafana   /‾‾/  
    /\  /  \     |\  __   /  /   
   /  \/    \    | |/ /  /   ‾‾\ 
  /          \   |   (  |  (‾)  |
 / __________ \  |_|\_\  \_____/ 


     execution: local
        script: post-stress.js
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
time="2026-05-28T17:54:22-03:00" level=info msg="Setup concluído: 800 usuários prontos." source=console

running (0m39.0s), 001/600 VUs, 0 complete and 0 interrupted iterations
default   [   0% ] 001/600 VUs  0m00.7s/4m00.0s

running (0m40.0s), 002/600 VUs, 1 complete and 0 interrupted iterations
default   [   1% ] 002/600 VUs  0m01.7s/4m00.0s

running (0m41.0s), 002/600 VUs, 2 complete and 0 interrupted iterations
default   [   1% ] 002/600 VUs  0m02.7s/4m00.0s

running (0m42.0s), 003/600 VUs, 4 complete and 0 interrupted iterations
default   [   2% ] 003/600 VUs  0m03.7s/4m00.0s

running (0m43.0s), 003/600 VUs, 7 complete and 0 interrupted iterations
default   [   2% ] 003/600 VUs  0m04.7s/4m00.0s

running (0m44.0s), 004/600 VUs, 10 complete and 0 interrupted iterations
default   [   2% ] 004/600 VUs  0m05.7s/4m00.0s

running (0m45.0s), 005/600 VUs, 13 complete and 0 interrupted iterations
default   [   3% ] 005/600 VUs  0m06.7s/4m00.0s

running (0m46.0s), 005/600 VUs, 18 complete and 0 interrupted iterations
default   [   3% ] 005/600 VUs  0m07.7s/4m00.0s

running (0m47.0s), 006/600 VUs, 22 complete and 0 interrupted iterations
default   [   4% ] 006/600 VUs  0m08.7s/4m00.0s

running (0m48.0s), 007/600 VUs, 27 complete and 0 interrupted iterations
default   [   4% ] 007/600 VUs  0m09.7s/4m00.0s

running (0m49.0s), 007/600 VUs, 34 complete and 0 interrupted iterations
default   [   4% ] 007/600 VUs  0m10.7s/4m00.0s

running (0m50.0s), 008/600 VUs, 39 complete and 0 interrupted iterations
default   [   5% ] 008/600 VUs  0m11.7s/4m00.0s

running (0m51.0s), 009/600 VUs, 47 complete and 0 interrupted iterations
default   [   5% ] 009/600 VUs  0m12.7s/4m00.0s

running (0m52.0s), 009/600 VUs, 54 complete and 0 interrupted iterations
default   [   6% ] 009/600 VUs  0m13.7s/4m00.0s

running (0m53.0s), 010/600 VUs, 62 complete and 0 interrupted iterations
default   [   6% ] 010/600 VUs  0m14.7s/4m00.0s

running (0m54.0s), 010/600 VUs, 71 complete and 0 interrupted iterations
default   [   7% ] 010/600 VUs  0m15.7s/4m00.0s

running (0m55.0s), 011/600 VUs, 79 complete and 0 interrupted iterations
default   [   7% ] 011/600 VUs  0m16.7s/4m00.0s

running (0m56.0s), 012/600 VUs, 90 complete and 0 interrupted iterations
default   [   7% ] 012/600 VUs  0m17.7s/4m00.0s

running (0m57.0s), 012/600 VUs, 100 complete and 0 interrupted iterations
default   [   8% ] 012/600 VUs  0m18.7s/4m00.0s

running (0m58.0s), 013/600 VUs, 111 complete and 0 interrupted iterations
default   [   8% ] 013/600 VUs  0m19.7s/4m00.0s

running (0m59.0s), 014/600 VUs, 122 complete and 0 interrupted iterations
default   [   9% ] 014/600 VUs  0m20.7s/4m00.0s

running (1m00.0s), 014/600 VUs, 135 complete and 0 interrupted iterations
default   [   9% ] 014/600 VUs  0m21.7s/4m00.0s

running (1m01.0s), 015/600 VUs, 147 complete and 0 interrupted iterations
default   [   9% ] 015/600 VUs  0m22.7s/4m00.0s

running (1m02.0s), 016/600 VUs, 159 complete and 0 interrupted iterations
default   [  10% ] 016/600 VUs  0m23.7s/4m00.0s

running (1m03.0s), 016/600 VUs, 174 complete and 0 interrupted iterations
default   [  10% ] 016/600 VUs  0m24.7s/4m00.0s

running (1m04.0s), 017/600 VUs, 187 complete and 0 interrupted iterations
default   [  11% ] 017/600 VUs  0m25.7s/4m00.0s

running (1m05.0s), 017/600 VUs, 202 complete and 0 interrupted iterations
default   [  11% ] 017/600 VUs  0m26.7s/4m00.0s

running (1m06.0s), 018/600 VUs, 218 complete and 0 interrupted iterations
default   [  12% ] 018/600 VUs  0m27.7s/4m00.0s

running (1m07.0s), 019/600 VUs, 233 complete and 0 interrupted iterations
default   [  12% ] 019/600 VUs  0m28.7s/4m00.0s

running (1m08.0s), 019/600 VUs, 251 complete and 0 interrupted iterations
default   [  12% ] 019/600 VUs  0m29.7s/4m00.0s

running (1m09.0s), 020/600 VUs, 267 complete and 0 interrupted iterations
default   [  13% ] 020/600 VUs  0m30.7s/4m00.0s

running (1m10.0s), 021/600 VUs, 285 complete and 0 interrupted iterations
default   [  13% ] 021/600 VUs  0m31.7s/4m00.0s

running (1m11.0s), 022/600 VUs, 303 complete and 0 interrupted iterations
default   [  14% ] 022/600 VUs  0m32.7s/4m00.0s

running (1m12.0s), 023/600 VUs, 323 complete and 0 interrupted iterations
default   [  14% ] 023/600 VUs  0m33.7s/4m00.0s

running (1m13.0s), 024/600 VUs, 344 complete and 0 interrupted iterations
default   [  14% ] 024/600 VUs  0m34.7s/4m00.0s

running (1m14.0s), 025/600 VUs, 365 complete and 0 interrupted iterations
default   [  15% ] 025/600 VUs  0m35.7s/4m00.0s

running (1m15.0s), 026/600 VUs, 387 complete and 0 interrupted iterations
default   [  15% ] 026/600 VUs  0m36.7s/4m00.0s

running (1m16.0s), 027/600 VUs, 410 complete and 0 interrupted iterations
default   [  16% ] 027/600 VUs  0m37.7s/4m00.0s

running (1m17.0s), 028/600 VUs, 434 complete and 0 interrupted iterations
default   [  16% ] 028/600 VUs  0m38.7s/4m00.0s

running (1m18.0s), 029/600 VUs, 458 complete and 0 interrupted iterations
default   [  17% ] 029/600 VUs  0m39.7s/4m00.0s

running (1m19.0s), 030/600 VUs, 483 complete and 0 interrupted iterations
default   [  17% ] 030/600 VUs  0m40.7s/4m00.0s

running (1m20.0s), 031/600 VUs, 511 complete and 0 interrupted iterations
default   [  17% ] 031/600 VUs  0m41.7s/4m00.0s

running (1m21.0s), 032/600 VUs, 538 complete and 0 interrupted iterations
default   [  18% ] 032/600 VUs  0m42.7s/4m00.0s

running (1m22.0s), 033/600 VUs, 567 complete and 0 interrupted iterations
default   [  18% ] 033/600 VUs  0m43.7s/4m00.0s

running (1m23.0s), 034/600 VUs, 594 complete and 0 interrupted iterations
default   [  19% ] 034/600 VUs  0m44.7s/4m00.0s

running (1m24.0s), 035/600 VUs, 626 complete and 0 interrupted iterations
default   [  19% ] 035/600 VUs  0m45.7s/4m00.0s

running (1m25.0s), 036/600 VUs, 655 complete and 0 interrupted iterations
default   [  19% ] 036/600 VUs  0m46.7s/4m00.0s

running (1m26.0s), 037/600 VUs, 689 complete and 0 interrupted iterations
default   [  20% ] 037/600 VUs  0m47.7s/4m00.0s

running (1m27.0s), 038/600 VUs, 720 complete and 0 interrupted iterations
default   [  20% ] 038/600 VUs  0m48.7s/4m00.0s

running (1m28.0s), 039/600 VUs, 754 complete and 0 interrupted iterations
default   [  21% ] 039/600 VUs  0m49.7s/4m00.0s

running (1m29.0s), 040/600 VUs, 789 complete and 0 interrupted iterations
default   [  21% ] 040/600 VUs  0m50.7s/4m00.0s

running (1m30.0s), 041/600 VUs, 824 complete and 0 interrupted iterations
default   [  22% ] 041/600 VUs  0m51.7s/4m00.0s

running (1m31.0s), 042/600 VUs, 862 complete and 0 interrupted iterations
default   [  22% ] 042/600 VUs  0m52.7s/4m00.0s

running (1m32.0s), 043/600 VUs, 897 complete and 0 interrupted iterations
default   [  22% ] 043/600 VUs  0m53.7s/4m00.0s

running (1m33.0s), 044/600 VUs, 933 complete and 0 interrupted iterations
default   [  23% ] 044/600 VUs  0m54.7s/4m00.0s

running (1m34.0s), 045/600 VUs, 974 complete and 0 interrupted iterations
default   [  23% ] 045/600 VUs  0m55.7s/4m00.0s

running (1m35.0s), 046/600 VUs, 1012 complete and 0 interrupted iterations
default   [  24% ] 046/600 VUs  0m56.7s/4m00.0s

running (1m36.0s), 047/600 VUs, 1049 complete and 0 interrupted iterations
default   [  24% ] 047/600 VUs  0m57.7s/4m00.0s

running (1m37.0s), 048/600 VUs, 1096 complete and 0 interrupted iterations
default   [  24% ] 048/600 VUs  0m58.7s/4m00.0s

running (1m38.0s), 049/600 VUs, 1137 complete and 0 interrupted iterations
default   [  25% ] 049/600 VUs  0m59.7s/4m00.0s

running (1m39.0s), 051/600 VUs, 1176 complete and 0 interrupted iterations
default   [  25% ] 051/600 VUs  1m00.7s/4m00.0s

running (1m40.0s), 052/600 VUs, 1224 complete and 0 interrupted iterations
default   [  26% ] 052/600 VUs  1m01.7s/4m00.0s

running (1m41.0s), 054/600 VUs, 1267 complete and 0 interrupted iterations
default   [  26% ] 054/600 VUs  1m02.7s/4m00.0s

running (1m42.0s), 056/600 VUs, 1318 complete and 0 interrupted iterations
default   [  27% ] 056/600 VUs  1m03.7s/4m00.0s

running (1m43.0s), 057/600 VUs, 1365 complete and 0 interrupted iterations
default   [  27% ] 057/600 VUs  1m04.7s/4m00.0s

running (1m44.0s), 059/600 VUs, 1410 complete and 0 interrupted iterations
default   [  27% ] 059/600 VUs  1m05.7s/4m00.0s

running (1m45.0s), 061/600 VUs, 1464 complete and 0 interrupted iterations
default   [  28% ] 061/600 VUs  1m06.7s/4m00.0s

running (1m46.0s), 062/600 VUs, 1521 complete and 0 interrupted iterations
default   [  28% ] 062/600 VUs  1m07.7s/4m00.0s

running (1m47.0s), 064/600 VUs, 1570 complete and 0 interrupted iterations
default   [  29% ] 064/600 VUs  1m08.7s/4m00.0s

running (1m48.0s), 066/600 VUs, 1630 complete and 0 interrupted iterations
default   [  29% ] 066/600 VUs  1m09.7s/4m00.0s

running (1m49.0s), 067/600 VUs, 1683 complete and 0 interrupted iterations
default   [  29% ] 067/600 VUs  1m10.7s/4m00.0s

running (1m50.0s), 069/600 VUs, 1741 complete and 0 interrupted iterations
default   [  30% ] 069/600 VUs  1m11.7s/4m00.0s

running (1m51.0s), 071/600 VUs, 1804 complete and 0 interrupted iterations
default   [  30% ] 071/600 VUs  1m12.7s/4m00.0s

running (1m52.0s), 072/600 VUs, 1863 complete and 0 interrupted iterations
default   [  31% ] 072/600 VUs  1m13.7s/4m00.0s

running (1m53.0s), 074/600 VUs, 1924 complete and 0 interrupted iterations
default   [  31% ] 074/600 VUs  1m14.7s/4m00.0s

running (1m54.0s), 076/600 VUs, 1988 complete and 0 interrupted iterations
default   [  32% ] 076/600 VUs  1m15.7s/4m00.0s

running (1m55.0s), 077/600 VUs, 2060 complete and 0 interrupted iterations
default   [  32% ] 077/600 VUs  1m16.7s/4m00.0s

running (1m56.0s), 079/600 VUs, 2125 complete and 0 interrupted iterations
default   [  32% ] 079/600 VUs  1m17.7s/4m00.0s

running (1m57.0s), 081/600 VUs, 2189 complete and 0 interrupted iterations
default   [  33% ] 081/600 VUs  1m18.7s/4m00.0s

running (1m58.0s), 082/600 VUs, 2258 complete and 0 interrupted iterations
default   [  33% ] 082/600 VUs  1m19.7s/4m00.0s

running (1m59.0s), 084/600 VUs, 2334 complete and 0 interrupted iterations
default   [  34% ] 084/600 VUs  1m20.7s/4m00.0s

running (2m00.0s), 086/600 VUs, 2404 complete and 0 interrupted iterations
default   [  34% ] 086/600 VUs  1m21.7s/4m00.0s

running (2m01.0s), 087/600 VUs, 2476 complete and 0 interrupted iterations
default   [  34% ] 087/600 VUs  1m22.7s/4m00.0s

running (2m02.0s), 089/600 VUs, 2555 complete and 0 interrupted iterations
default   [  35% ] 089/600 VUs  1m23.7s/4m00.0s

running (2m03.0s), 091/600 VUs, 2639 complete and 0 interrupted iterations
default   [  35% ] 091/600 VUs  1m24.7s/4m00.0s

running (2m04.0s), 092/600 VUs, 2706 complete and 0 interrupted iterations
default   [  36% ] 092/600 VUs  1m25.7s/4m00.0s

running (2m05.0s), 094/600 VUs, 2790 complete and 0 interrupted iterations
default   [  36% ] 094/600 VUs  1m26.7s/4m00.0s

running (2m06.0s), 096/600 VUs, 2873 complete and 0 interrupted iterations
default   [  37% ] 096/600 VUs  1m27.7s/4m00.0s

running (2m07.0s), 097/600 VUs, 2955 complete and 0 interrupted iterations
default   [  37% ] 097/600 VUs  1m28.7s/4m00.0s

running (2m08.0s), 099/600 VUs, 3038 complete and 0 interrupted iterations
default   [  37% ] 099/600 VUs  1m29.7s/4m00.0s

running (2m09.0s), 102/600 VUs, 3127 complete and 0 interrupted iterations
default   [  38% ] 102/600 VUs  1m30.7s/4m00.0s

running (2m10.0s), 105/600 VUs, 3218 complete and 0 interrupted iterations
default   [  38% ] 105/600 VUs  1m31.7s/4m00.0s

running (2m11.0s), 109/600 VUs, 3305 complete and 0 interrupted iterations
default   [  39% ] 109/600 VUs  1m32.7s/4m00.0s

running (2m12.0s), 112/600 VUs, 3399 complete and 0 interrupted iterations
default   [  39% ] 112/600 VUs  1m33.7s/4m00.0s

running (2m13.0s), 115/600 VUs, 3496 complete and 0 interrupted iterations
default   [  39% ] 115/600 VUs  1m34.7s/4m00.0s

running (2m14.0s), 119/600 VUs, 3598 complete and 0 interrupted iterations
default   [  40% ] 119/600 VUs  1m35.7s/4m00.0s

running (2m15.0s), 122/600 VUs, 3703 complete and 0 interrupted iterations
default   [  40% ] 122/600 VUs  1m36.7s/4m00.0s

running (2m16.0s), 125/600 VUs, 3803 complete and 0 interrupted iterations
default   [  41% ] 125/600 VUs  1m37.7s/4m00.0s

running (2m17.0s), 129/600 VUs, 3911 complete and 0 interrupted iterations
default   [  41% ] 129/600 VUs  1m38.7s/4m00.0s

running (2m18.0s), 132/600 VUs, 4029 complete and 0 interrupted iterations
default   [  42% ] 132/600 VUs  1m39.7s/4m00.0s

running (2m19.0s), 135/600 VUs, 4138 complete and 0 interrupted iterations
default   [  42% ] 135/600 VUs  1m40.7s/4m00.0s

running (2m20.0s), 139/600 VUs, 4254 complete and 0 interrupted iterations
default   [  42% ] 139/600 VUs  1m41.7s/4m00.0s

running (2m21.0s), 142/600 VUs, 4376 complete and 0 interrupted iterations
default   [  43% ] 142/600 VUs  1m42.7s/4m00.0s

running (2m22.0s), 145/600 VUs, 4492 complete and 0 interrupted iterations
default   [  43% ] 145/600 VUs  1m43.7s/4m00.0s

running (2m23.0s), 149/600 VUs, 4615 complete and 0 interrupted iterations
default   [  44% ] 149/600 VUs  1m44.7s/4m00.0s

running (2m24.0s), 152/600 VUs, 4748 complete and 0 interrupted iterations
default   [  44% ] 152/600 VUs  1m45.7s/4m00.0s

running (2m25.0s), 155/600 VUs, 4884 complete and 0 interrupted iterations
default   [  44% ] 155/600 VUs  1m46.7s/4m00.0s

running (2m26.0s), 159/600 VUs, 5017 complete and 0 interrupted iterations
default   [  45% ] 159/600 VUs  1m47.7s/4m00.0s

running (2m27.0s), 162/600 VUs, 5155 complete and 0 interrupted iterations
default   [  45% ] 162/600 VUs  1m48.7s/4m00.0s

running (2m28.0s), 165/600 VUs, 5284 complete and 0 interrupted iterations
default   [  46% ] 165/600 VUs  1m49.7s/4m00.0s
time="2026-05-28T17:56:12-03:00" level=warning msg="The test has generated metrics with 100131 unique time series, which is higher than the suggested limit of 100000 and could cause high memory usage. Consider not using high-cardinality values like unique IDs as metric tags or, if you need them in the URL, use the name metric tag or URL grouping. See https://grafana.com/docs/k6/latest/using-k6/tags-and-groups/ for details." component=metrics-engine-ingester

running (2m29.0s), 169/600 VUs, 5426 complete and 0 interrupted iterations
default   [  46% ] 169/600 VUs  1m50.7s/4m00.0s

running (2m30.0s), 172/600 VUs, 5569 complete and 0 interrupted iterations
default   [  47% ] 172/600 VUs  1m51.7s/4m00.0s

running (2m31.0s), 175/600 VUs, 5724 complete and 0 interrupted iterations
default   [  47% ] 175/600 VUs  1m52.7s/4m00.0s

running (2m32.0s), 179/600 VUs, 5881 complete and 0 interrupted iterations
default   [  47% ] 179/600 VUs  1m53.7s/4m00.0s

running (2m33.0s), 182/600 VUs, 6024 complete and 0 interrupted iterations
default   [  48% ] 182/600 VUs  1m54.7s/4m00.0s

running (2m34.0s), 185/600 VUs, 6185 complete and 0 interrupted iterations
default   [  48% ] 185/600 VUs  1m55.7s/4m00.0s

running (2m35.0s), 189/600 VUs, 6349 complete and 0 interrupted iterations
default   [  49% ] 189/600 VUs  1m56.7s/4m00.0s

running (2m36.0s), 192/600 VUs, 6504 complete and 0 interrupted iterations
default   [  49% ] 192/600 VUs  1m57.7s/4m00.0s

running (2m37.0s), 195/600 VUs, 6666 complete and 0 interrupted iterations
default   [  49% ] 195/600 VUs  1m58.7s/4m00.0s

running (2m38.0s), 199/600 VUs, 6837 complete and 0 interrupted iterations
default   [  50% ] 199/600 VUs  1m59.7s/4m00.0s

running (2m39.0s), 202/600 VUs, 7015 complete and 0 interrupted iterations
default   [  50% ] 202/600 VUs  2m00.7s/4m00.0s

running (2m40.0s), 205/600 VUs, 7190 complete and 0 interrupted iterations
default   [  51% ] 205/600 VUs  2m01.7s/4m00.0s

running (2m41.0s), 209/600 VUs, 7364 complete and 0 interrupted iterations
default   [  51% ] 209/600 VUs  2m02.7s/4m00.0s

running (2m42.0s), 212/600 VUs, 7538 complete and 0 interrupted iterations
default   [  52% ] 212/600 VUs  2m03.7s/4m00.0s

running (2m43.0s), 215/600 VUs, 7714 complete and 0 interrupted iterations
default   [  52% ] 215/600 VUs  2m04.7s/4m00.0s

running (2m44.0s), 219/600 VUs, 7897 complete and 0 interrupted iterations
default   [  52% ] 219/600 VUs  2m05.7s/4m00.0s

running (2m45.0s), 222/600 VUs, 8087 complete and 0 interrupted iterations
default   [  53% ] 222/600 VUs  2m06.7s/4m00.0s

running (2m46.0s), 225/600 VUs, 8285 complete and 0 interrupted iterations
default   [  53% ] 225/600 VUs  2m07.7s/4m00.0s

running (2m47.0s), 229/600 VUs, 8469 complete and 0 interrupted iterations
default   [  54% ] 229/600 VUs  2m08.7s/4m00.0s

running (2m48.0s), 232/600 VUs, 8667 complete and 0 interrupted iterations
default   [  54% ] 232/600 VUs  2m09.7s/4m00.0s

running (2m49.0s), 235/600 VUs, 8866 complete and 0 interrupted iterations
default   [  54% ] 235/600 VUs  2m10.7s/4m00.0s

running (2m50.0s), 239/600 VUs, 9063 complete and 0 interrupted iterations
default   [  55% ] 239/600 VUs  2m11.7s/4m00.0s

running (2m51.0s), 242/600 VUs, 9264 complete and 0 interrupted iterations
default   [  55% ] 242/600 VUs  2m12.7s/4m00.0s

running (2m52.0s), 245/600 VUs, 9476 complete and 0 interrupted iterations
default   [  56% ] 245/600 VUs  2m13.7s/4m00.0s

running (2m53.0s), 249/600 VUs, 9680 complete and 0 interrupted iterations
default   [  56% ] 249/600 VUs  2m14.7s/4m00.0s

running (2m54.0s), 252/600 VUs, 9888 complete and 0 interrupted iterations
default   [  57% ] 252/600 VUs  2m15.7s/4m00.0s

running (2m55.0s), 255/600 VUs, 10107 complete and 0 interrupted iterations
default   [  57% ] 255/600 VUs  2m16.7s/4m00.0s

running (2m56.0s), 259/600 VUs, 10320 complete and 0 interrupted iterations
default   [  57% ] 259/600 VUs  2m17.7s/4m00.0s

running (2m57.0s), 262/600 VUs, 10528 complete and 0 interrupted iterations
default   [  58% ] 262/600 VUs  2m18.7s/4m00.0s

running (2m58.0s), 265/600 VUs, 10749 complete and 0 interrupted iterations
default   [  58% ] 265/600 VUs  2m19.7s/4m00.0s
time="2026-05-28T17:56:42-03:00" level=warning msg="The test has generated metrics with 200004 unique time series, which is higher than the suggested limit of 100000 and could cause high memory usage. Consider not using high-cardinality values like unique IDs as metric tags or, if you need them in the URL, use the name metric tag or URL grouping. See https://grafana.com/docs/k6/latest/using-k6/tags-and-groups/ for details." component=metrics-engine-ingester

running (2m59.0s), 269/600 VUs, 10983 complete and 0 interrupted iterations
default   [  59% ] 269/600 VUs  2m20.7s/4m00.0s

running (3m00.0s), 272/600 VUs, 11193 complete and 0 interrupted iterations
default   [  59% ] 272/600 VUs  2m21.7s/4m00.0s

running (3m01.0s), 275/600 VUs, 11430 complete and 0 interrupted iterations
default   [  59% ] 275/600 VUs  2m22.7s/4m00.0s

running (3m02.0s), 279/600 VUs, 11660 complete and 0 interrupted iterations
default   [  60% ] 279/600 VUs  2m23.7s/4m00.0s

running (3m03.0s), 282/600 VUs, 11894 complete and 0 interrupted iterations
default   [  60% ] 282/600 VUs  2m24.7s/4m00.0s

running (3m04.0s), 285/600 VUs, 12129 complete and 0 interrupted iterations
default   [  61% ] 285/600 VUs  2m25.7s/4m00.0s

running (3m05.0s), 289/600 VUs, 12371 complete and 0 interrupted iterations
default   [  61% ] 289/600 VUs  2m26.7s/4m00.0s

running (3m06.0s), 292/600 VUs, 12602 complete and 0 interrupted iterations
default   [  62% ] 292/600 VUs  2m27.7s/4m00.0s

running (3m07.0s), 295/600 VUs, 12840 complete and 0 interrupted iterations
default   [  62% ] 295/600 VUs  2m28.7s/4m00.0s

running (3m08.0s), 299/600 VUs, 13100 complete and 0 interrupted iterations
default   [  62% ] 299/600 VUs  2m29.7s/4m00.0s

running (3m09.0s), 302/600 VUs, 13340 complete and 0 interrupted iterations
default   [  63% ] 302/600 VUs  2m30.7s/4m00.0s

running (3m10.0s), 305/600 VUs, 13591 complete and 0 interrupted iterations
default   [  63% ] 305/600 VUs  2m31.7s/4m00.0s

running (3m11.0s), 309/600 VUs, 13825 complete and 0 interrupted iterations
default   [  64% ] 309/600 VUs  2m32.7s/4m00.0s

running (3m12.0s), 312/600 VUs, 14103 complete and 0 interrupted iterations
default   [  64% ] 312/600 VUs  2m33.7s/4m00.0s

running (3m13.0s), 315/600 VUs, 14345 complete and 0 interrupted iterations
default   [  64% ] 315/600 VUs  2m34.7s/4m00.0s

running (3m14.0s), 319/600 VUs, 14596 complete and 0 interrupted iterations
default   [  65% ] 319/600 VUs  2m35.7s/4m00.0s

running (3m15.0s), 322/600 VUs, 14834 complete and 0 interrupted iterations
default   [  65% ] 322/600 VUs  2m36.7s/4m00.0s

running (3m16.0s), 325/600 VUs, 15094 complete and 0 interrupted iterations
default   [  66% ] 325/600 VUs  2m37.7s/4m00.0s

running (3m17.0s), 329/600 VUs, 15349 complete and 0 interrupted iterations
default   [  66% ] 329/600 VUs  2m38.7s/4m00.0s

running (3m18.0s), 332/600 VUs, 15616 complete and 0 interrupted iterations
default   [  67% ] 332/600 VUs  2m39.7s/4m00.0s

running (3m19.0s), 335/600 VUs, 15867 complete and 0 interrupted iterations
default   [  67% ] 335/600 VUs  2m40.7s/4m00.0s

running (3m20.0s), 339/600 VUs, 16129 complete and 0 interrupted iterations
default   [  67% ] 339/600 VUs  2m41.7s/4m00.0s

running (3m21.0s), 342/600 VUs, 16409 complete and 0 interrupted iterations
default   [  68% ] 342/600 VUs  2m42.7s/4m00.0s

running (3m22.0s), 345/600 VUs, 16676 complete and 0 interrupted iterations
default   [  68% ] 345/600 VUs  2m43.7s/4m00.0s

running (3m23.0s), 349/600 VUs, 16924 complete and 0 interrupted iterations
default   [  69% ] 349/600 VUs  2m44.7s/4m00.0s

running (3m24.0s), 352/600 VUs, 17190 complete and 0 interrupted iterations
default   [  69% ] 352/600 VUs  2m45.7s/4m00.0s

running (3m25.0s), 355/600 VUs, 17461 complete and 0 interrupted iterations
default   [  69% ] 355/600 VUs  2m46.7s/4m00.0s

running (3m26.0s), 359/600 VUs, 17733 complete and 0 interrupted iterations
default   [  70% ] 359/600 VUs  2m47.7s/4m00.0s

running (3m27.0s), 362/600 VUs, 17990 complete and 0 interrupted iterations
default   [  70% ] 362/600 VUs  2m48.7s/4m00.0s

running (3m28.0s), 365/600 VUs, 18254 complete and 0 interrupted iterations
default   [  71% ] 365/600 VUs  2m49.7s/4m00.0s

running (3m29.0s), 369/600 VUs, 18479 complete and 0 interrupted iterations
default   [  71% ] 369/600 VUs  2m50.7s/4m00.0s

running (3m30.0s), 372/600 VUs, 18769 complete and 0 interrupted iterations
default   [  72% ] 372/600 VUs  2m51.7s/4m00.0s

running (3m31.0s), 375/600 VUs, 19014 complete and 0 interrupted iterations
default   [  72% ] 375/600 VUs  2m52.7s/4m00.0s

running (3m32.0s), 379/600 VUs, 19276 complete and 0 interrupted iterations
default   [  72% ] 379/600 VUs  2m53.7s/4m00.0s

running (3m33.0s), 382/600 VUs, 19552 complete and 0 interrupted iterations
default   [  73% ] 382/600 VUs  2m54.7s/4m00.0s

running (3m34.0s), 385/600 VUs, 19803 complete and 0 interrupted iterations
default   [  73% ] 385/600 VUs  2m55.7s/4m00.0s

running (3m35.0s), 389/600 VUs, 20055 complete and 0 interrupted iterations
default   [  74% ] 389/600 VUs  2m56.7s/4m00.0s

running (3m36.0s), 392/600 VUs, 20344 complete and 0 interrupted iterations
default   [  74% ] 392/600 VUs  2m57.7s/4m00.0s

running (3m37.0s), 395/600 VUs, 20598 complete and 0 interrupted iterations
default   [  74% ] 395/600 VUs  2m58.7s/4m00.0s

running (3m38.0s), 399/600 VUs, 20864 complete and 0 interrupted iterations
default   [  75% ] 399/600 VUs  2m59.7s/4m00.0s

running (3m39.0s), 404/600 VUs, 21157 complete and 0 interrupted iterations
default   [  75% ] 404/600 VUs  3m00.7s/4m00.0s

running (3m40.0s), 411/600 VUs, 21410 complete and 0 interrupted iterations
default   [  76% ] 411/600 VUs  3m01.7s/4m00.0s

running (3m41.0s), 418/600 VUs, 21707 complete and 0 interrupted iterations
default   [  76% ] 418/600 VUs  3m02.7s/4m00.0s
time="2026-05-28T17:57:25-03:00" level=warning msg="The test has generated metrics with 400083 unique time series, which is higher than the suggested limit of 100000 and could cause high memory usage. Consider not using high-cardinality values like unique IDs as metric tags or, if you need them in the URL, use the name metric tag or URL grouping. See https://grafana.com/docs/k6/latest/using-k6/tags-and-groups/ for details." component=metrics-engine-ingester

running (3m42.0s), 424/600 VUs, 21929 complete and 0 interrupted iterations
default   [  77% ] 424/600 VUs  3m03.7s/4m00.0s

running (3m43.0s), 431/600 VUs, 22230 complete and 0 interrupted iterations
default   [  77% ] 431/600 VUs  3m04.7s/4m00.0s

running (3m44.0s), 438/600 VUs, 22496 complete and 0 interrupted iterations
default   [  77% ] 438/600 VUs  3m05.7s/4m00.0s

running (3m45.0s), 444/600 VUs, 22710 complete and 0 interrupted iterations
default   [  78% ] 444/600 VUs  3m06.7s/4m00.0s

running (3m46.0s), 451/600 VUs, 22965 complete and 0 interrupted iterations
default   [  78% ] 451/600 VUs  3m07.7s/4m00.0s

running (3m47.0s), 458/600 VUs, 23235 complete and 0 interrupted iterations
default   [  79% ] 458/600 VUs  3m08.7s/4m00.0s

running (3m48.0s), 464/600 VUs, 23529 complete and 0 interrupted iterations
default   [  79% ] 464/600 VUs  3m09.7s/4m00.0s

running (3m49.0s), 471/600 VUs, 23767 complete and 0 interrupted iterations
default   [  79% ] 471/600 VUs  3m10.7s/4m00.0s

running (3m50.0s), 478/600 VUs, 24057 complete and 0 interrupted iterations
default   [  80% ] 478/600 VUs  3m11.7s/4m00.0s

running (3m51.0s), 484/600 VUs, 24315 complete and 0 interrupted iterations
default   [  80% ] 484/600 VUs  3m12.7s/4m00.0s

running (3m52.0s), 491/600 VUs, 24607 complete and 0 interrupted iterations
default   [  81% ] 491/600 VUs  3m13.7s/4m00.0s

running (3m53.0s), 498/600 VUs, 24822 complete and 0 interrupted iterations
default   [  81% ] 498/600 VUs  3m14.7s/4m00.0s

running (3m54.0s), 504/600 VUs, 25125 complete and 0 interrupted iterations
default   [  82% ] 504/600 VUs  3m15.7s/4m00.0s

running (3m55.0s), 511/600 VUs, 25353 complete and 0 interrupted iterations
default   [  82% ] 511/600 VUs  3m16.7s/4m00.0s

running (3m56.0s), 518/600 VUs, 25649 complete and 0 interrupted iterations
default   [  82% ] 518/600 VUs  3m17.7s/4m00.0s

running (3m57.0s), 524/600 VUs, 25884 complete and 0 interrupted iterations
default   [  83% ] 524/600 VUs  3m18.7s/4m00.0s

running (3m58.0s), 531/600 VUs, 26185 complete and 0 interrupted iterations
default   [  83% ] 531/600 VUs  3m19.7s/4m00.0s

running (3m59.0s), 538/600 VUs, 26432 complete and 0 interrupted iterations
default   [  84% ] 538/600 VUs  3m20.7s/4m00.0s

running (4m00.0s), 544/600 VUs, 26698 complete and 0 interrupted iterations
default   [  84% ] 544/600 VUs  3m21.7s/4m00.0s

running (4m01.0s), 551/600 VUs, 26951 complete and 0 interrupted iterations
default   [  84% ] 551/600 VUs  3m22.7s/4m00.0s

running (4m02.0s), 558/600 VUs, 27205 complete and 0 interrupted iterations
default   [  85% ] 558/600 VUs  3m23.7s/4m00.0s

running (4m03.0s), 564/600 VUs, 27453 complete and 0 interrupted iterations
default   [  85% ] 564/600 VUs  3m24.7s/4m00.0s

running (4m04.0s), 571/600 VUs, 27746 complete and 0 interrupted iterations
default   [  86% ] 571/600 VUs  3m25.7s/4m00.0s

running (4m05.0s), 578/600 VUs, 27974 complete and 0 interrupted iterations
default   [  86% ] 578/600 VUs  3m26.7s/4m00.0s

running (4m06.0s), 584/600 VUs, 28276 complete and 0 interrupted iterations
default   [  87% ] 584/600 VUs  3m27.7s/4m00.0s

running (4m07.0s), 591/600 VUs, 28518 complete and 0 interrupted iterations
default   [  87% ] 591/600 VUs  3m28.7s/4m00.0s

running (4m08.0s), 598/600 VUs, 28800 complete and 0 interrupted iterations
default   [  87% ] 598/600 VUs  3m29.7s/4m00.0s

running (4m09.0s), 599/600 VUs, 29052 complete and 0 interrupted iterations
default   [  88% ] 599/600 VUs  3m30.7s/4m00.0s

running (4m10.0s), 590/600 VUs, 29306 complete and 0 interrupted iterations
default   [  88% ] 590/600 VUs  3m31.7s/4m00.0s

running (4m11.0s), 568/600 VUs, 29608 complete and 0 interrupted iterations
default   [  89% ] 568/600 VUs  3m32.7s/4m00.0s

running (4m12.0s), 548/600 VUs, 29878 complete and 0 interrupted iterations
default   [  89% ] 548/600 VUs  3m33.7s/4m00.0s

running (4m13.0s), 526/600 VUs, 30187 complete and 0 interrupted iterations
default   [  89% ] 526/600 VUs  3m34.7s/4m00.0s

running (4m14.0s), 500/600 VUs, 30454 complete and 0 interrupted iterations
default   [  90% ] 500/600 VUs  3m35.7s/4m00.0s

running (4m15.0s), 486/600 VUs, 30746 complete and 0 interrupted iterations
default   [  90% ] 486/600 VUs  3m36.7s/4m00.0s

running (4m16.0s), 467/600 VUs, 31027 complete and 0 interrupted iterations
default   [  91% ] 467/600 VUs  3m37.7s/4m00.0s

running (4m17.0s), 446/600 VUs, 31291 complete and 0 interrupted iterations
default   [  91% ] 446/600 VUs  3m38.7s/4m00.0s

running (4m18.0s), 424/600 VUs, 31588 complete and 0 interrupted iterations
default   [  92% ] 424/600 VUs  3m39.7s/4m00.0s

running (4m19.0s), 402/600 VUs, 31849 complete and 0 interrupted iterations
default   [  92% ] 402/600 VUs  3m40.7s/4m00.0s

running (4m20.0s), 383/600 VUs, 32150 complete and 0 interrupted iterations
default   [  92% ] 383/600 VUs  3m41.7s/4m00.0s

running (4m21.0s), 360/600 VUs, 32425 complete and 0 interrupted iterations
default   [  93% ] 360/600 VUs  3m42.7s/4m00.0s

running (4m22.0s), 342/600 VUs, 32682 complete and 0 interrupted iterations
default   [  93% ] 342/600 VUs  3m43.7s/4m00.0s

running (4m23.0s), 320/600 VUs, 32960 complete and 0 interrupted iterations
default   [  94% ] 320/600 VUs  3m44.7s/4m00.0s

running (4m24.0s), 297/600 VUs, 33221 complete and 0 interrupted iterations
default   [  94% ] 297/600 VUs  3m45.7s/4m00.0s

running (4m25.0s), 279/600 VUs, 33465 complete and 0 interrupted iterations
default   [  94% ] 279/600 VUs  3m46.7s/4m00.0s

running (4m26.0s), 257/600 VUs, 33697 complete and 0 interrupted iterations
default   [  95% ] 257/600 VUs  3m47.7s/4m00.0s

running (4m27.0s), 237/600 VUs, 33912 complete and 0 interrupted iterations
default   [  95% ] 237/600 VUs  3m48.7s/4m00.0s

running (4m28.0s), 219/600 VUs, 34093 complete and 0 interrupted iterations
default   [  96% ] 219/600 VUs  3m49.7s/4m00.0s

running (4m29.0s), 199/600 VUs, 34280 complete and 0 interrupted iterations
default   [  96% ] 199/600 VUs  3m50.7s/4m00.0s

running (4m30.0s), 178/600 VUs, 34448 complete and 0 interrupted iterations
default   [  97% ] 178/600 VUs  3m51.7s/4m00.0s

running (4m31.0s), 156/600 VUs, 34602 complete and 0 interrupted iterations
default   [  97% ] 156/600 VUs  3m52.7s/4m00.0s

running (4m32.0s), 137/600 VUs, 34741 complete and 0 interrupted iterations
default   [  97% ] 137/600 VUs  3m53.7s/4m00.0s

running (4m33.0s), 124/600 VUs, 34854 complete and 0 interrupted iterations
default   [  98% ] 124/600 VUs  3m54.7s/4m00.0s

running (4m34.0s), 095/600 VUs, 34971 complete and 0 interrupted iterations
default   [  98% ] 095/600 VUs  3m55.7s/4m00.0s

running (4m35.0s), 078/600 VUs, 35053 complete and 0 interrupted iterations
default   [  99% ] 078/600 VUs  3m56.7s/4m00.0s

running (4m36.0s), 055/600 VUs, 35122 complete and 0 interrupted iterations
default   [  99% ] 055/600 VUs  3m57.7s/4m00.0s

running (4m37.0s), 037/600 VUs, 35169 complete and 0 interrupted iterations
default   [  99% ] 037/600 VUs  3m58.7s/4m00.0s

running (4m38.0s), 015/600 VUs, 35206 complete and 0 interrupted iterations
default   [ 100% ] 015/600 VUs  3m59.7s/4m00.0s

running (4m39.0s), 001/600 VUs, 35220 complete and 0 interrupted iterations
default ↓ [ 100% ] 011/600 VUs  4m0s


  █ THRESHOLDS 

    http_req_duration
    ✓ 'p(95)<1500' p(95)=268.21ms

    http_req_failed
    ✓ 'rate<0.05' rate=0.00%


  █ TOTAL RESULTS 

    checks_total.......: 177705  636.747328/s
    checks_succeeded...: 100.00% 177705 out of 177705
    checks_failed......: 0.00%   0 out of 177705

    ✓ register 201
    ✓ login 200
    ✓ list 200
    ✓ list tem content
    ✓ create 201
    ✓ get 200
    ✓ delete 204

    HTTP
    http_req_duration..............: avg=82.14ms min=3.47ms med=36.08ms max=831ms p(90)=225.95ms p(95)=268.21ms
      { expected_response:true }...: avg=82.14ms min=3.47ms med=36.08ms max=831ms p(90)=225.95ms p(95)=268.21ms
    http_req_failed................: 0.00%  0 out of 142484
    http_reqs......................: 142484 510.544477/s

    EXECUTION
    iteration_duration.............: avg=1.43s   min=1.12s  med=1.26s   max=2.8s  p(90)=2s       p(95)=2.15s   
    iterations.....................: 35221  126.202851/s
    vus............................: 1      min=0           max=599
    vus_max........................: 600    min=600         max=600

    NETWORK
    data_received..................: 75 MB  268 kB/s
    data_sent......................: 63 MB  225 kB/s




running (4m39.1s), 000/600 VUs, 35221 complete and 0 interrupted iterations
default ✓ [ 100% ] 000/600 VUs  4m0s

================================================================
% cd DomainFeed/comment && k6 run comment-load.js
================================================================


         /\      Grafana   /‾‾/  
    /\  /  \     |\  __   /  /   
   /  \/    \    | |/ /  /   ‾‾\ 
  /          \   |   (  |  (‾)  |
 / __________ \  |_|\_\  \_____/ 


     execution: local
        script: comment-load.js
        output: -

     scenarios: (100.00%) 2 scenarios, 210 max VUs, 2m30s max duration (incl. graceful stop):
              * crud: 158 looping VUs for 2m0s (exec: crudComment, gracefulStop: 30s)
              * listing: 52 looping VUs for 2m0s (exec: listComments, gracefulStop: 30s)


Run       [ 100% ] setup()
crud      [   0% ]
listing   [   0% ]

Run       [ 100% ] setup()
crud      [   0% ]
listing   [   0% ]

Run       [ 100% ] setup()
crud      [   0% ]
listing   [   0% ]

Run       [ 100% ] setup()
crud      [   0% ]
listing   [   0% ]

Run       [ 100% ] setup()
crud      [   0% ]
listing   [   0% ]

Run       [ 100% ] setup()
crud      [   0% ]
listing   [   0% ]

Run       [ 100% ] setup()
crud      [   0% ]
listing   [   0% ]

Run       [ 100% ] setup()
crud      [   0% ]
listing   [   0% ]

Run       [ 100% ] setup()
crud      [   0% ]
listing   [   0% ]

Run       [ 100% ] setup()
crud      [   0% ]
listing   [   0% ]

Run       [ 100% ] setup()
crud      [   0% ]
listing   [   0% ]

Run       [ 100% ] setup()
crud      [   0% ]
listing   [   0% ]

Run       [ 100% ] setup()
crud      [   0% ]
listing   [   0% ]

Run       [ 100% ] setup()
crud      [   0% ]
listing   [   0% ]

Run       [ 100% ] setup()
crud      [   0% ]
listing   [   0% ]

Run       [ 100% ] setup()
crud      [   0% ]
listing   [   0% ]

Run       [ 100% ] setup()
crud      [   0% ]
listing   [   0% ]

Run       [ 100% ] setup()
crud      [   0% ]
listing   [   0% ]
time="2026-05-28T17:58:42-03:00" level=info msg="Setup concluído: 230 usuários prontos de 230 tentativas." source=console

running (0m19.0s), 210/210 VUs, 0 complete and 0 interrupted iterations
crud      [   0% ] 158 VUs  0m00.3s/2m0s
listing   [   0% ] 52 VUs   0m00.3s/2m0s

running (0m20.0s), 210/210 VUs, 104 complete and 0 interrupted iterations
crud      [   1% ] 158 VUs  0m01.3s/2m0s
listing   [   1% ] 52 VUs   0m01.3s/2m0s

running (0m21.0s), 210/210 VUs, 333 complete and 0 interrupted iterations
crud      [   2% ] 158 VUs  0m02.3s/2m0s
listing   [   2% ] 52 VUs   0m02.3s/2m0s

running (0m22.0s), 210/210 VUs, 461 complete and 0 interrupted iterations
crud      [   3% ] 158 VUs  0m03.3s/2m0s
listing   [   3% ] 52 VUs   0m03.3s/2m0s

running (0m23.0s), 210/210 VUs, 681 complete and 0 interrupted iterations
crud      [   4% ] 158 VUs  0m04.3s/2m0s
listing   [   4% ] 52 VUs   0m04.3s/2m0s

running (0m24.0s), 210/210 VUs, 820 complete and 0 interrupted iterations
crud      [   4% ] 158 VUs  0m05.3s/2m0s
listing   [   4% ] 52 VUs   0m05.3s/2m0s

running (0m25.0s), 210/210 VUs, 1041 complete and 0 interrupted iterations
crud      [   5% ] 158 VUs  0m06.3s/2m0s
listing   [   5% ] 52 VUs   0m06.3s/2m0s

running (0m26.0s), 210/210 VUs, 1171 complete and 0 interrupted iterations
crud      [   6% ] 158 VUs  0m07.3s/2m0s
listing   [   6% ] 52 VUs   0m07.3s/2m0s

running (0m27.0s), 210/210 VUs, 1404 complete and 0 interrupted iterations
crud      [   7% ] 158 VUs  0m08.3s/2m0s
listing   [   7% ] 52 VUs   0m08.3s/2m0s

running (0m28.0s), 210/210 VUs, 1523 complete and 0 interrupted iterations
crud      [   8% ] 158 VUs  0m09.3s/2m0s
listing   [   8% ] 52 VUs   0m09.3s/2m0s

running (0m29.0s), 210/210 VUs, 1775 complete and 0 interrupted iterations
crud      [   9% ] 158 VUs  0m10.3s/2m0s
listing   [   9% ] 52 VUs   0m10.3s/2m0s

running (0m30.0s), 210/210 VUs, 1889 complete and 0 interrupted iterations
crud      [   9% ] 158 VUs  0m11.3s/2m0s
listing   [   9% ] 52 VUs   0m11.3s/2m0s

running (0m31.0s), 210/210 VUs, 2145 complete and 0 interrupted iterations
crud      [  10% ] 158 VUs  0m12.3s/2m0s
listing   [  10% ] 52 VUs   0m12.3s/2m0s

running (0m32.0s), 210/210 VUs, 2248 complete and 0 interrupted iterations
crud      [  11% ] 158 VUs  0m13.3s/2m0s
listing   [  11% ] 52 VUs   0m13.3s/2m0s

running (0m33.0s), 210/210 VUs, 2510 complete and 0 interrupted iterations
crud      [  12% ] 158 VUs  0m14.3s/2m0s
listing   [  12% ] 52 VUs   0m14.3s/2m0s

running (0m34.0s), 210/210 VUs, 2614 complete and 0 interrupted iterations
crud      [  13% ] 158 VUs  0m15.3s/2m0s
listing   [  13% ] 52 VUs   0m15.3s/2m0s

running (0m35.0s), 210/210 VUs, 2876 complete and 0 interrupted iterations
crud      [  14% ] 158 VUs  0m16.3s/2m0s
listing   [  14% ] 52 VUs   0m16.3s/2m0s

running (0m36.0s), 210/210 VUs, 2980 complete and 0 interrupted iterations
crud      [  14% ] 158 VUs  0m17.3s/2m0s
listing   [  14% ] 52 VUs   0m17.3s/2m0s

running (0m37.0s), 210/210 VUs, 3242 complete and 0 interrupted iterations
crud      [  15% ] 158 VUs  0m18.3s/2m0s
listing   [  15% ] 52 VUs   0m18.3s/2m0s

running (0m38.0s), 210/210 VUs, 3346 complete and 0 interrupted iterations
crud      [  16% ] 158 VUs  0m19.3s/2m0s
listing   [  16% ] 52 VUs   0m19.3s/2m0s

running (0m39.0s), 210/210 VUs, 3608 complete and 0 interrupted iterations
crud      [  17% ] 158 VUs  0m20.3s/2m0s
listing   [  17% ] 52 VUs   0m20.3s/2m0s

running (0m40.0s), 210/210 VUs, 3712 complete and 0 interrupted iterations
crud      [  18% ] 158 VUs  0m21.3s/2m0s
listing   [  18% ] 52 VUs   0m21.3s/2m0s

running (0m41.0s), 210/210 VUs, 3974 complete and 0 interrupted iterations
crud      [  19% ] 158 VUs  0m22.3s/2m0s
listing   [  19% ] 52 VUs   0m22.3s/2m0s

running (0m42.0s), 210/210 VUs, 4078 complete and 0 interrupted iterations
crud      [  19% ] 158 VUs  0m23.3s/2m0s
listing   [  19% ] 52 VUs   0m23.3s/2m0s

running (0m43.0s), 210/210 VUs, 4340 complete and 0 interrupted iterations
crud      [  20% ] 158 VUs  0m24.3s/2m0s
listing   [  20% ] 52 VUs   0m24.3s/2m0s

running (0m44.0s), 210/210 VUs, 4444 complete and 0 interrupted iterations
crud      [  21% ] 158 VUs  0m25.3s/2m0s
listing   [  21% ] 52 VUs   0m25.3s/2m0s

running (0m45.0s), 210/210 VUs, 4706 complete and 0 interrupted iterations
crud      [  22% ] 158 VUs  0m26.3s/2m0s
listing   [  22% ] 52 VUs   0m26.3s/2m0s

running (0m46.0s), 210/210 VUs, 4807 complete and 0 interrupted iterations
crud      [  23% ] 158 VUs  0m27.3s/2m0s
listing   [  23% ] 52 VUs   0m27.3s/2m0s

running (0m47.0s), 210/210 VUs, 5067 complete and 0 interrupted iterations
crud      [  24% ] 158 VUs  0m28.3s/2m0s
listing   [  24% ] 52 VUs   0m28.3s/2m0s

running (0m48.0s), 210/210 VUs, 5163 complete and 0 interrupted iterations
crud      [  24% ] 158 VUs  0m29.3s/2m0s
listing   [  24% ] 52 VUs   0m29.3s/2m0s

running (0m49.0s), 210/210 VUs, 5424 complete and 0 interrupted iterations
crud      [  25% ] 158 VUs  0m30.3s/2m0s
listing   [  25% ] 52 VUs   0m30.3s/2m0s

running (0m50.0s), 210/210 VUs, 5518 complete and 0 interrupted iterations
crud      [  26% ] 158 VUs  0m31.3s/2m0s
listing   [  26% ] 52 VUs   0m31.3s/2m0s

running (0m51.0s), 210/210 VUs, 5780 complete and 0 interrupted iterations
crud      [  27% ] 158 VUs  0m32.3s/2m0s
listing   [  27% ] 52 VUs   0m32.3s/2m0s

running (0m52.0s), 210/210 VUs, 5884 complete and 0 interrupted iterations
crud      [  28% ] 158 VUs  0m33.3s/2m0s
listing   [  28% ] 52 VUs   0m33.3s/2m0s

running (0m53.0s), 210/210 VUs, 6141 complete and 0 interrupted iterations
crud      [  29% ] 158 VUs  0m34.3s/2m0s
listing   [  29% ] 52 VUs   0m34.3s/2m0s

running (0m54.0s), 210/210 VUs, 6235 complete and 0 interrupted iterations
crud      [  29% ] 158 VUs  0m35.3s/2m0s
listing   [  29% ] 52 VUs   0m35.3s/2m0s

running (0m55.0s), 210/210 VUs, 6497 complete and 0 interrupted iterations
crud      [  30% ] 158 VUs  0m36.3s/2m0s
listing   [  30% ] 52 VUs   0m36.3s/2m0s

running (0m56.0s), 210/210 VUs, 6599 complete and 0 interrupted iterations
crud      [  31% ] 158 VUs  0m37.3s/2m0s
listing   [  31% ] 52 VUs   0m37.3s/2m0s

running (0m57.0s), 210/210 VUs, 6861 complete and 0 interrupted iterations
crud      [  32% ] 158 VUs  0m38.3s/2m0s
listing   [  32% ] 52 VUs   0m38.3s/2m0s

running (0m58.0s), 210/210 VUs, 6963 complete and 0 interrupted iterations
crud      [  33% ] 158 VUs  0m39.3s/2m0s
listing   [  33% ] 52 VUs   0m39.3s/2m0s

running (0m59.0s), 210/210 VUs, 7219 complete and 0 interrupted iterations
crud      [  34% ] 158 VUs  0m40.3s/2m0s
listing   [  34% ] 52 VUs   0m40.3s/2m0s

running (1m00.0s), 210/210 VUs, 7328 complete and 0 interrupted iterations
crud      [  34% ] 158 VUs  0m41.3s/2m0s
listing   [  34% ] 52 VUs   0m41.3s/2m0s

running (1m01.0s), 210/210 VUs, 7585 complete and 0 interrupted iterations
crud      [  35% ] 158 VUs  0m42.3s/2m0s
listing   [  35% ] 52 VUs   0m42.3s/2m0s

running (1m02.0s), 210/210 VUs, 7693 complete and 0 interrupted iterations
crud      [  36% ] 158 VUs  0m43.3s/2m0s
listing   [  36% ] 52 VUs   0m43.3s/2m0s

running (1m03.0s), 210/210 VUs, 7949 complete and 0 interrupted iterations
crud      [  37% ] 158 VUs  0m44.3s/2m0s
listing   [  37% ] 52 VUs   0m44.3s/2m0s
time="2026-05-28T17:59:26-03:00" level=warning msg="The test has generated metrics with 100238 unique time series, which is higher than the suggested limit of 100000 and could cause high memory usage. Consider not using high-cardinality values like unique IDs as metric tags or, if you need them in the URL, use the name metric tag or URL grouping. See https://grafana.com/docs/k6/latest/using-k6/tags-and-groups/ for details." component=metrics-engine-ingester

running (1m04.0s), 210/210 VUs, 8063 complete and 0 interrupted iterations
crud      [  38% ] 158 VUs  0m45.3s/2m0s
listing   [  38% ] 52 VUs   0m45.3s/2m0s

running (1m05.0s), 210/210 VUs, 8314 complete and 0 interrupted iterations
crud      [  39% ] 158 VUs  0m46.3s/2m0s
listing   [  39% ] 52 VUs   0m46.3s/2m0s

running (1m06.0s), 210/210 VUs, 8430 complete and 0 interrupted iterations
crud      [  39% ] 158 VUs  0m47.3s/2m0s
listing   [  39% ] 52 VUs   0m47.3s/2m0s

running (1m07.0s), 210/210 VUs, 8680 complete and 0 interrupted iterations
crud      [  40% ] 158 VUs  0m48.3s/2m0s
listing   [  40% ] 52 VUs   0m48.3s/2m0s

running (1m08.0s), 210/210 VUs, 8800 complete and 0 interrupted iterations
crud      [  41% ] 158 VUs  0m49.3s/2m0s
listing   [  41% ] 52 VUs   0m49.3s/2m0s

running (1m09.0s), 210/210 VUs, 9046 complete and 0 interrupted iterations
crud      [  42% ] 158 VUs  0m50.3s/2m0s
listing   [  42% ] 52 VUs   0m50.3s/2m0s

running (1m10.0s), 210/210 VUs, 9170 complete and 0 interrupted iterations
crud      [  43% ] 158 VUs  0m51.3s/2m0s
listing   [  43% ] 52 VUs   0m51.3s/2m0s

running (1m11.0s), 210/210 VUs, 9412 complete and 0 interrupted iterations
crud      [  44% ] 158 VUs  0m52.3s/2m0s
listing   [  44% ] 52 VUs   0m52.3s/2m0s

running (1m12.0s), 210/210 VUs, 9536 complete and 0 interrupted iterations
crud      [  44% ] 158 VUs  0m53.3s/2m0s
listing   [  44% ] 52 VUs   0m53.3s/2m0s

running (1m13.0s), 210/210 VUs, 9778 complete and 0 interrupted iterations
crud      [  45% ] 158 VUs  0m54.3s/2m0s
listing   [  45% ] 52 VUs   0m54.3s/2m0s

running (1m14.0s), 210/210 VUs, 9901 complete and 0 interrupted iterations
crud      [  46% ] 158 VUs  0m55.3s/2m0s
listing   [  46% ] 52 VUs   0m55.3s/2m0s

running (1m15.0s), 210/210 VUs, 10131 complete and 0 interrupted iterations
crud      [  47% ] 158 VUs  0m56.3s/2m0s
listing   [  47% ] 52 VUs   0m56.3s/2m0s

running (1m16.0s), 210/210 VUs, 10262 complete and 0 interrupted iterations
crud      [  48% ] 158 VUs  0m57.3s/2m0s
listing   [  48% ] 52 VUs   0m57.3s/2m0s

running (1m17.0s), 210/210 VUs, 10491 complete and 0 interrupted iterations
crud      [  49% ] 158 VUs  0m58.3s/2m0s
listing   [  49% ] 52 VUs   0m58.3s/2m0s

running (1m18.0s), 210/210 VUs, 10625 complete and 0 interrupted iterations
crud      [  49% ] 158 VUs  0m59.3s/2m0s
listing   [  49% ] 52 VUs   0m59.3s/2m0s

running (1m19.0s), 210/210 VUs, 10843 complete and 0 interrupted iterations
crud      [  50% ] 158 VUs  1m00.3s/2m0s
listing   [  50% ] 52 VUs   1m00.3s/2m0s

running (1m20.0s), 210/210 VUs, 10981 complete and 0 interrupted iterations
crud      [  51% ] 158 VUs  1m01.3s/2m0s
listing   [  51% ] 52 VUs   1m01.3s/2m0s

running (1m21.0s), 210/210 VUs, 11199 complete and 0 interrupted iterations
crud      [  52% ] 158 VUs  1m02.3s/2m0s
listing   [  52% ] 52 VUs   1m02.3s/2m0s

running (1m22.0s), 210/210 VUs, 11334 complete and 0 interrupted iterations
crud      [  53% ] 158 VUs  1m03.3s/2m0s
listing   [  53% ] 52 VUs   1m03.3s/2m0s

running (1m23.0s), 210/210 VUs, 11559 complete and 0 interrupted iterations
crud      [  54% ] 158 VUs  1m04.3s/2m0s
listing   [  54% ] 52 VUs   1m04.3s/2m0s

running (1m24.0s), 210/210 VUs, 11709 complete and 0 interrupted iterations
crud      [  54% ] 158 VUs  1m05.3s/2m0s
listing   [  54% ] 52 VUs   1m05.3s/2m0s

running (1m25.0s), 210/210 VUs, 11925 complete and 0 interrupted iterations
crud      [  55% ] 158 VUs  1m06.3s/2m0s
listing   [  55% ] 52 VUs   1m06.3s/2m0s

running (1m26.0s), 210/210 VUs, 12089 complete and 0 interrupted iterations
crud      [  56% ] 158 VUs  1m07.3s/2m0s
listing   [  56% ] 52 VUs   1m07.3s/2m0s

running (1m27.0s), 210/210 VUs, 12291 complete and 0 interrupted iterations
crud      [  57% ] 158 VUs  1m08.3s/2m0s
listing   [  57% ] 52 VUs   1m08.3s/2m0s

running (1m28.0s), 210/210 VUs, 12471 complete and 0 interrupted iterations
crud      [  58% ] 158 VUs  1m09.3s/2m0s
listing   [  58% ] 52 VUs   1m09.3s/2m0s

running (1m29.0s), 210/210 VUs, 12657 complete and 0 interrupted iterations
crud      [  59% ] 158 VUs  1m10.3s/2m0s
listing   [  59% ] 52 VUs   1m10.3s/2m0s

running (1m30.0s), 210/210 VUs, 12860 complete and 0 interrupted iterations
crud      [  59% ] 158 VUs  1m11.3s/2m0s
listing   [  59% ] 52 VUs   1m11.3s/2m0s

running (1m31.0s), 210/210 VUs, 13022 complete and 0 interrupted iterations
crud      [  60% ] 158 VUs  1m12.3s/2m0s
listing   [  60% ] 52 VUs   1m12.3s/2m0s

running (1m32.0s), 210/210 VUs, 13239 complete and 0 interrupted iterations
crud      [  61% ] 158 VUs  1m13.3s/2m0s
listing   [  61% ] 52 VUs   1m13.3s/2m0s

running (1m33.0s), 210/210 VUs, 13387 complete and 0 interrupted iterations
crud      [  62% ] 158 VUs  1m14.3s/2m0s
listing   [  62% ] 52 VUs   1m14.3s/2m0s

running (1m34.0s), 210/210 VUs, 13619 complete and 0 interrupted iterations
crud      [  63% ] 158 VUs  1m15.3s/2m0s
listing   [  63% ] 52 VUs   1m15.3s/2m0s

running (1m35.0s), 210/210 VUs, 13753 complete and 0 interrupted iterations
crud      [  64% ] 158 VUs  1m16.3s/2m0s
listing   [  64% ] 52 VUs   1m16.3s/2m0s

running (1m36.0s), 210/210 VUs, 13987 complete and 0 interrupted iterations
crud      [  64% ] 158 VUs  1m17.3s/2m0s
listing   [  64% ] 52 VUs   1m17.3s/2m0s

running (1m37.0s), 210/210 VUs, 14119 complete and 0 interrupted iterations
crud      [  65% ] 158 VUs  1m18.3s/2m0s
listing   [  65% ] 52 VUs   1m18.3s/2m0s

running (1m38.0s), 210/210 VUs, 14373 complete and 0 interrupted iterations
crud      [  66% ] 158 VUs  1m19.3s/2m0s
listing   [  66% ] 52 VUs   1m19.3s/2m0s

running (1m39.0s), 210/210 VUs, 14485 complete and 0 interrupted iterations
crud      [  67% ] 158 VUs  1m20.3s/2m0s
listing   [  67% ] 52 VUs   1m20.3s/2m0s

running (1m40.0s), 210/210 VUs, 14741 complete and 0 interrupted iterations
crud      [  68% ] 158 VUs  1m21.3s/2m0s
listing   [  68% ] 52 VUs   1m21.3s/2m0s

running (1m41.0s), 210/210 VUs, 14833 complete and 0 interrupted iterations
crud      [  69% ] 158 VUs  1m22.3s/2m0s
listing   [  69% ] 52 VUs   1m22.3s/2m0s

running (1m42.0s), 210/210 VUs, 15089 complete and 0 interrupted iterations
crud      [  69% ] 158 VUs  1m23.3s/2m0s
listing   [  69% ] 52 VUs   1m23.3s/2m0s

running (1m43.0s), 210/210 VUs, 15188 complete and 0 interrupted iterations
crud      [  70% ] 158 VUs  1m24.3s/2m0s
listing   [  70% ] 52 VUs   1m24.3s/2m0s

running (1m44.0s), 210/210 VUs, 15447 complete and 0 interrupted iterations
crud      [  71% ] 158 VUs  1m25.3s/2m0s
listing   [  71% ] 52 VUs   1m25.3s/2m0s

running (1m45.0s), 210/210 VUs, 15556 complete and 0 interrupted iterations
crud      [  72% ] 158 VUs  1m26.3s/2m0s
listing   [  72% ] 52 VUs   1m26.3s/2m0s

running (1m46.0s), 210/210 VUs, 15813 complete and 0 interrupted iterations
crud      [  73% ] 158 VUs  1m27.3s/2m0s
listing   [  73% ] 52 VUs   1m27.3s/2m0s

running (1m47.0s), 210/210 VUs, 15916 complete and 0 interrupted iterations
crud      [  74% ] 158 VUs  1m28.3s/2m0s
listing   [  74% ] 52 VUs   1m28.3s/2m0s

running (1m48.0s), 210/210 VUs, 16165 complete and 0 interrupted iterations
crud      [  74% ] 158 VUs  1m29.3s/2m0s
listing   [  74% ] 52 VUs   1m29.3s/2m0s
time="2026-05-28T18:00:12-03:00" level=warning msg="The test has generated metrics with 200165 unique time series, which is higher than the suggested limit of 100000 and could cause high memory usage. Consider not using high-cardinality values like unique IDs as metric tags or, if you need them in the URL, use the name metric tag or URL grouping. See https://grafana.com/docs/k6/latest/using-k6/tags-and-groups/ for details." component=metrics-engine-ingester

running (1m49.0s), 210/210 VUs, 16272 complete and 0 interrupted iterations
crud      [  75% ] 158 VUs  1m30.3s/2m0s
listing   [  75% ] 52 VUs   1m30.3s/2m0s

running (1m50.0s), 210/210 VUs, 16527 complete and 0 interrupted iterations
crud      [  76% ] 158 VUs  1m31.3s/2m0s
listing   [  76% ] 52 VUs   1m31.3s/2m0s

running (1m51.0s), 210/210 VUs, 16636 complete and 0 interrupted iterations
crud      [  77% ] 158 VUs  1m32.3s/2m0s
listing   [  77% ] 52 VUs   1m32.3s/2m0s

running (1m52.0s), 210/210 VUs, 16893 complete and 0 interrupted iterations
crud      [  78% ] 158 VUs  1m33.3s/2m0s
listing   [  78% ] 52 VUs   1m33.3s/2m0s

running (1m53.0s), 210/210 VUs, 17003 complete and 0 interrupted iterations
crud      [  79% ] 158 VUs  1m34.3s/2m0s
listing   [  79% ] 52 VUs   1m34.3s/2m0s

running (1m54.0s), 210/210 VUs, 17259 complete and 0 interrupted iterations
crud      [  79% ] 158 VUs  1m35.3s/2m0s
listing   [  79% ] 52 VUs   1m35.3s/2m0s

running (1m55.0s), 210/210 VUs, 17370 complete and 0 interrupted iterations
crud      [  80% ] 158 VUs  1m36.3s/2m0s
listing   [  80% ] 52 VUs   1m36.3s/2m0s

running (1m56.0s), 210/210 VUs, 17622 complete and 0 interrupted iterations
crud      [  81% ] 158 VUs  1m37.3s/2m0s
listing   [  81% ] 52 VUs   1m37.3s/2m0s

running (1m57.0s), 210/210 VUs, 17739 complete and 0 interrupted iterations
crud      [  82% ] 158 VUs  1m38.3s/2m0s
listing   [  82% ] 52 VUs   1m38.3s/2m0s

running (1m58.0s), 210/210 VUs, 17988 complete and 0 interrupted iterations
crud      [  83% ] 158 VUs  1m39.3s/2m0s
listing   [  83% ] 52 VUs   1m39.3s/2m0s

running (1m59.0s), 210/210 VUs, 18109 complete and 0 interrupted iterations
crud      [  84% ] 158 VUs  1m40.3s/2m0s
listing   [  84% ] 52 VUs   1m40.3s/2m0s

running (2m00.0s), 210/210 VUs, 18354 complete and 0 interrupted iterations
crud      [  84% ] 158 VUs  1m41.3s/2m0s
listing   [  84% ] 52 VUs   1m41.3s/2m0s

running (2m01.0s), 210/210 VUs, 18467 complete and 0 interrupted iterations
crud      [  85% ] 158 VUs  1m42.3s/2m0s
listing   [  85% ] 52 VUs   1m42.3s/2m0s

running (2m02.0s), 210/210 VUs, 18711 complete and 0 interrupted iterations
crud      [  86% ] 158 VUs  1m43.3s/2m0s
listing   [  86% ] 52 VUs   1m43.3s/2m0s

running (2m03.0s), 210/210 VUs, 18832 complete and 0 interrupted iterations
crud      [  87% ] 158 VUs  1m44.3s/2m0s
listing   [  87% ] 52 VUs   1m44.3s/2m0s

running (2m04.0s), 210/210 VUs, 19068 complete and 0 interrupted iterations
crud      [  88% ] 158 VUs  1m45.3s/2m0s
listing   [  88% ] 52 VUs   1m45.3s/2m0s

running (2m05.0s), 210/210 VUs, 19195 complete and 0 interrupted iterations
crud      [  89% ] 158 VUs  1m46.3s/2m0s
listing   [  89% ] 52 VUs   1m46.3s/2m0s

running (2m06.0s), 210/210 VUs, 19431 complete and 0 interrupted iterations
crud      [  89% ] 158 VUs  1m47.3s/2m0s
listing   [  89% ] 52 VUs   1m47.3s/2m0s

running (2m07.0s), 210/210 VUs, 19557 complete and 0 interrupted iterations
crud      [  90% ] 158 VUs  1m48.3s/2m0s
listing   [  90% ] 52 VUs   1m48.3s/2m0s

running (2m08.0s), 210/210 VUs, 19791 complete and 0 interrupted iterations
crud      [  91% ] 158 VUs  1m49.3s/2m0s
listing   [  91% ] 52 VUs   1m49.3s/2m0s

running (2m09.0s), 210/210 VUs, 19917 complete and 0 interrupted iterations
crud      [  92% ] 158 VUs  1m50.3s/2m0s
listing   [  92% ] 52 VUs   1m50.3s/2m0s

running (2m10.0s), 210/210 VUs, 20154 complete and 0 interrupted iterations
crud      [  93% ] 158 VUs  1m51.3s/2m0s
listing   [  93% ] 52 VUs   1m51.3s/2m0s

running (2m11.0s), 210/210 VUs, 20285 complete and 0 interrupted iterations
crud      [  94% ] 158 VUs  1m52.3s/2m0s
listing   [  94% ] 52 VUs   1m52.3s/2m0s

running (2m12.0s), 210/210 VUs, 20519 complete and 0 interrupted iterations
crud      [  94% ] 158 VUs  1m53.3s/2m0s
listing   [  94% ] 52 VUs   1m53.3s/2m0s

running (2m13.0s), 210/210 VUs, 20647 complete and 0 interrupted iterations
crud      [  95% ] 158 VUs  1m54.3s/2m0s
listing   [  95% ] 52 VUs   1m54.3s/2m0s

running (2m14.0s), 210/210 VUs, 20881 complete and 0 interrupted iterations
crud      [  96% ] 158 VUs  1m55.3s/2m0s
listing   [  96% ] 52 VUs   1m55.3s/2m0s

running (2m15.0s), 210/210 VUs, 21015 complete and 0 interrupted iterations
crud      [  97% ] 158 VUs  1m56.3s/2m0s
listing   [  97% ] 52 VUs   1m56.3s/2m0s

running (2m16.0s), 210/210 VUs, 21242 complete and 0 interrupted iterations
crud      [  98% ] 158 VUs  1m57.3s/2m0s
listing   [  98% ] 52 VUs   1m57.3s/2m0s

running (2m17.0s), 210/210 VUs, 21377 complete and 0 interrupted iterations
crud      [  99% ] 158 VUs  1m58.3s/2m0s
listing   [  99% ] 52 VUs   1m58.3s/2m0s

running (2m18.0s), 210/210 VUs, 21603 complete and 0 interrupted iterations
crud      [  99% ] 158 VUs  1m59.3s/2m0s
listing   [  99% ] 52 VUs   1m59.3s/2m0s

running (2m19.0s), 180/210 VUs, 21739 complete and 0 interrupted iterations
crud    ↓ [ 100% ] 158 VUs  2m0s
listing ↓ [ 100% ] 52 VUs   2m0s

running (2m20.0s), 024/210 VUs, 21895 complete and 0 interrupted iterations
crud    ↓ [ 100% ] 158 VUs  2m0s
listing ✓ [ 100% ] 52 VUs   2m0s


  █ THRESHOLDS 

    http_req_duration
    ✓ 'p(95)<1500' p(95)=31.93ms

      {scenario:crud}
      ✓ 'p(95)<1500' p(95)=34.55ms

      {scenario:listing}
      ✓ 'p(95)<500' p(95)=19.88ms

    http_req_failed
    ✓ 'rate<0.02' rate=0.00%


  █ TOTAL RESULTS 

    checks_total.......: 61717   438.909878/s
    checks_succeeded...: 100.00% 61717 out of 61717
    checks_failed......: 0.00%   0 out of 61717

    ✓ register 201
    ✓ login 200
    ✓ shelf created 201
    ✓ book added to shelf 201
    ✓ review base 201
    ✓ list 200
    ✓ create 201
    ✓ create retorna id
    ✓ get 200
    ✓ update 200
    ✓ delete 204

    HTTP
    http_req_duration..............: avg=16.2ms  min=3.02ms   med=13.09ms  max=268.13ms p(90)=25.97ms p(95)=31.93ms
      { expected_response:true }...: avg=16.2ms  min=3.02ms   med=13.09ms  max=268.13ms p(90)=25.97ms p(95)=31.93ms
      { scenario:crud }............: avg=18.16ms min=3.66ms   med=15.05ms  max=268.13ms p(90)=27.67ms p(95)=34.55ms
      { scenario:listing }.........: avg=10.02ms min=3.02ms   med=8.22ms   max=242.44ms p(90)=14.64ms p(95)=19.88ms
    http_req_failed................: 0.00% 0 out of 52055
    http_reqs......................: 52055 370.197088/s

    EXECUTION
    iteration_duration.............: avg=1.15s   min=503.17ms med=514.57ms max=2.28s    p(90)=1.98s   p(95)=1.99s  
    iterations.....................: 21919 155.880319/s
    vus............................: 24    min=0          max=210
    vus_max........................: 210   min=210        max=210

    NETWORK
    data_received..................: 27 MB 194 kB/s
    data_sent......................: 24 MB 171 kB/s




running (2m20.6s), 000/210 VUs, 21919 complete and 0 interrupted iterations
crud    ✓ [ 100% ] 158 VUs  2m0s
listing ✓ [ 100% ] 52 VUs   2m0s

================================================================
% cd DomainFeed/comment && k6 run comment-spike.js
================================================================


         /\      Grafana   /‾‾/  
    /\  /  \     |\  __   /  /   
   /  \/    \    | |/ /  /   ‾‾\ 
  /          \   |   (  |  (‾)  |
 / __________ \  |_|\_\  \_____/ 


     execution: local
        script: comment-spike.js
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
time="2026-05-28T18:01:24-03:00" level=info msg="Setup concluído: 500 usuários prontos de 500 tentativas." source=console

running (0m41.0s), 006/500 VUs, 1 complete and 0 interrupted iterations
default   [   2% ] 006/500 VUs  00.9s/50.0s

running (0m42.0s), 013/500 VUs, 11 complete and 0 interrupted iterations
default   [   4% ] 013/500 VUs  01.9s/50.0s

running (0m43.0s), 020/500 VUs, 30 complete and 0 interrupted iterations
default   [   6% ] 020/500 VUs  02.9s/50.0s

running (0m44.0s), 027/500 VUs, 60 complete and 0 interrupted iterations
default   [   8% ] 027/500 VUs  03.9s/50.0s

running (0m45.0s), 034/500 VUs, 99 complete and 0 interrupted iterations
default   [  10% ] 034/500 VUs  04.9s/50.0s

running (0m46.0s), 041/500 VUs, 148 complete and 0 interrupted iterations
default   [  12% ] 041/500 VUs  05.9s/50.0s

running (0m47.0s), 048/500 VUs, 203 complete and 0 interrupted iterations
default   [  14% ] 048/500 VUs  06.9s/50.0s

running (0m48.0s), 055/500 VUs, 269 complete and 0 interrupted iterations
default   [  16% ] 055/500 VUs  07.9s/50.0s

running (0m49.0s), 062/500 VUs, 343 complete and 0 interrupted iterations
default   [  18% ] 062/500 VUs  08.9s/50.0s

running (0m50.0s), 069/500 VUs, 430 complete and 0 interrupted iterations
default   [  20% ] 069/500 VUs  09.9s/50.0s

running (0m51.0s), 144/500 VUs, 536 complete and 0 interrupted iterations
default   [  22% ] 144/500 VUs  10.9s/50.0s

running (0m52.0s), 230/500 VUs, 740 complete and 0 interrupted iterations
default   [  24% ] 230/500 VUs  11.9s/50.0s

running (0m53.0s), 316/500 VUs, 976 complete and 0 interrupted iterations
default   [  26% ] 316/500 VUs  12.9s/50.0s

running (0m54.0s), 402/500 VUs, 1303 complete and 0 interrupted iterations
default   [  28% ] 402/500 VUs  13.9s/50.0s

running (0m55.0s), 488/500 VUs, 1588 complete and 0 interrupted iterations
default   [  30% ] 488/500 VUs  14.9s/50.0s

running (0m56.0s), 500/500 VUs, 1907 complete and 0 interrupted iterations
default   [  32% ] 500/500 VUs  15.9s/50.0s

running (0m57.0s), 500/500 VUs, 2240 complete and 0 interrupted iterations
default   [  34% ] 500/500 VUs  16.9s/50.0s

running (0m58.0s), 500/500 VUs, 2581 complete and 0 interrupted iterations
default   [  36% ] 500/500 VUs  17.9s/50.0s

running (0m59.0s), 500/500 VUs, 2897 complete and 0 interrupted iterations
default   [  38% ] 500/500 VUs  18.9s/50.0s

running (1m00.0s), 500/500 VUs, 3211 complete and 0 interrupted iterations
default   [  40% ] 500/500 VUs  19.9s/50.0s

running (1m01.0s), 500/500 VUs, 3509 complete and 0 interrupted iterations
default   [  42% ] 500/500 VUs  20.9s/50.0s

running (1m02.0s), 500/500 VUs, 3815 complete and 0 interrupted iterations
default   [  44% ] 500/500 VUs  21.9s/50.0s

running (1m03.0s), 500/500 VUs, 4189 complete and 0 interrupted iterations
default   [  46% ] 500/500 VUs  22.9s/50.0s

running (1m04.0s), 500/500 VUs, 4516 complete and 0 interrupted iterations
default   [  48% ] 500/500 VUs  23.9s/50.0s

running (1m05.0s), 500/500 VUs, 4832 complete and 0 interrupted iterations
default   [  50% ] 500/500 VUs  24.9s/50.0s

running (1m06.0s), 500/500 VUs, 5188 complete and 0 interrupted iterations
default   [  52% ] 500/500 VUs  25.9s/50.0s

running (1m07.0s), 500/500 VUs, 5521 complete and 0 interrupted iterations
default   [  54% ] 500/500 VUs  26.9s/50.0s

running (1m08.0s), 500/500 VUs, 5858 complete and 0 interrupted iterations
default   [  56% ] 500/500 VUs  27.9s/50.0s

running (1m09.0s), 500/500 VUs, 6190 complete and 0 interrupted iterations
default   [  58% ] 500/500 VUs  28.9s/50.0s

running (1m10.0s), 500/500 VUs, 6523 complete and 0 interrupted iterations
default   [  60% ] 500/500 VUs  29.9s/50.0s

running (1m11.0s), 500/500 VUs, 6848 complete and 0 interrupted iterations
default   [  62% ] 500/500 VUs  30.9s/50.0s

running (1m12.0s), 500/500 VUs, 7202 complete and 0 interrupted iterations
default   [  64% ] 500/500 VUs  31.9s/50.0s

running (1m13.0s), 500/500 VUs, 7515 complete and 0 interrupted iterations
default   [  66% ] 500/500 VUs  32.9s/50.0s

running (1m14.0s), 500/500 VUs, 7878 complete and 0 interrupted iterations
default   [  68% ] 500/500 VUs  33.9s/50.0s

running (1m15.0s), 500/500 VUs, 8166 complete and 0 interrupted iterations
default   [  70% ] 500/500 VUs  34.9s/50.0s

running (1m16.0s), 480/500 VUs, 8481 complete and 0 interrupted iterations
default   [  72% ] 480/500 VUs  35.9s/50.0s

running (1m17.0s), 397/500 VUs, 8825 complete and 0 interrupted iterations
default   [  74% ] 397/500 VUs  36.9s/50.0s

running (1m18.0s), 302/500 VUs, 9192 complete and 0 interrupted iterations
default   [  76% ] 302/500 VUs  37.9s/50.0s
time="2026-05-28T18:02:02-03:00" level=warning msg="The test has generated metrics with 100042 unique time series, which is higher than the suggested limit of 100000 and could cause high memory usage. Consider not using high-cardinality values like unique IDs as metric tags or, if you need them in the URL, use the name metric tag or URL grouping. See https://grafana.com/docs/k6/latest/using-k6/tags-and-groups/ for details." component=metrics-engine-ingester

running (1m19.0s), 200/500 VUs, 9552 complete and 0 interrupted iterations
default   [  78% ] 200/500 VUs  38.9s/50.0s

running (1m20.0s), 114/500 VUs, 9795 complete and 0 interrupted iterations
default   [  80% ] 114/500 VUs  39.9s/50.0s

running (1m21.0s), 067/500 VUs, 9937 complete and 0 interrupted iterations
default   [  82% ] 067/500 VUs  40.9s/50.0s

running (1m22.0s), 060/500 VUs, 10021 complete and 0 interrupted iterations
default   [  84% ] 060/500 VUs  41.9s/50.0s

running (1m23.0s), 052/500 VUs, 10106 complete and 0 interrupted iterations
default   [  86% ] 052/500 VUs  42.9s/50.0s

running (1m24.0s), 046/500 VUs, 10174 complete and 0 interrupted iterations
default   [  88% ] 046/500 VUs  43.9s/50.0s

running (1m25.0s), 040/500 VUs, 10235 complete and 0 interrupted iterations
default   [  90% ] 040/500 VUs  44.9s/50.0s

running (1m26.0s), 031/500 VUs, 10291 complete and 0 interrupted iterations
default   [  92% ] 031/500 VUs  45.9s/50.0s

running (1m27.0s), 026/500 VUs, 10328 complete and 0 interrupted iterations
default   [  94% ] 026/500 VUs  46.9s/50.0s

running (1m28.0s), 017/500 VUs, 10366 complete and 0 interrupted iterations
default   [  96% ] 017/500 VUs  47.9s/50.0s

running (1m29.0s), 012/500 VUs, 10387 complete and 0 interrupted iterations
default   [  98% ] 012/500 VUs  48.9s/50.0s

running (1m30.0s), 005/500 VUs, 10401 complete and 0 interrupted iterations
default   [ 100% ] 005/500 VUs  49.9s/50.0s


  █ THRESHOLDS 

    http_req_duration
    ✓ 'p(95)<1000' p(95)=417.12ms

    http_req_failed
    ✓ 'rate<0.05' rate=0.00%


  █ TOTAL RESULTS 

    checks_total.......: 33718   372.792812/s
    checks_succeeded...: 100.00% 33718 out of 33718
    checks_failed......: 0.00%   0 out of 33718

    ✓ register 201
    ✓ login 200
    ✓ shelf created 201
    ✓ book added to shelf 201
    ✓ review base 201
    ✓ list 200
    ✓ create 201 ou 429
    ✓ delete 204

    HTTP
    http_req_duration..............: avg=194.39ms min=3.28ms   med=218.2ms max=992.22ms p(90)=357.48ms p(95)=417.12ms
      { expected_response:true }...: avg=194.39ms min=3.28ms   med=218.2ms max=992.22ms p(90)=357.48ms p(95)=417.12ms
    http_req_failed................: 0.00% 0 out of 33718
    http_reqs......................: 33718 372.792812/s

    EXECUTION
    iteration_duration.............: avg=1.32s    min=720.44ms med=1.42s   max=2.34s    p(90)=1.66s    p(95)=1.74s   
    iterations.....................: 10406 115.050774/s
    vus............................: 5     min=0          max=500
    vus_max........................: 500   min=500        max=500

    NETWORK
    data_received..................: 16 MB 182 kB/s
    data_sent......................: 15 MB 169 kB/s




running (1m30.4s), 000/500 VUs, 10406 complete and 0 interrupted iterations
default ✓ [ 100% ] 000/500 VUs  50s

================================================================
% cd DomainFeed/comment && k6 run comment-stress.js
================================================================


         /\      Grafana   /‾‾/  
    /\  /  \     |\  __   /  /   
   /  \/    \    | |/ /  /   ‾‾\ 
  /          \   |   (  |  (‾)  |
 / __________ \  |_|\_\  \_____/ 


     execution: local
        script: comment-stress.js
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
time="2026-05-28T18:03:20-03:00" level=info msg="Setup concluído: 800 usuários prontos de 800 tentativas." source=console

running (1m06.0s), 001/600 VUs, 0 complete and 0 interrupted iterations
default   [   0% ] 001/600 VUs  0m00.8s/4m00.0s

running (1m07.0s), 002/600 VUs, 1 complete and 0 interrupted iterations
default   [   1% ] 002/600 VUs  0m01.8s/4m00.0s

running (1m08.0s), 002/600 VUs, 3 complete and 0 interrupted iterations
default   [   1% ] 002/600 VUs  0m02.8s/4m00.0s

running (1m09.0s), 003/600 VUs, 4 complete and 0 interrupted iterations
default   [   2% ] 003/600 VUs  0m03.8s/4m00.0s

running (1m10.0s), 004/600 VUs, 7 complete and 0 interrupted iterations
default   [   2% ] 004/600 VUs  0m04.8s/4m00.0s

running (1m11.0s), 004/600 VUs, 10 complete and 0 interrupted iterations
default   [   2% ] 004/600 VUs  0m05.8s/4m00.0s

running (1m12.0s), 005/600 VUs, 13 complete and 0 interrupted iterations
default   [   3% ] 005/600 VUs  0m06.8s/4m00.0s

running (1m13.0s), 005/600 VUs, 18 complete and 0 interrupted iterations
default   [   3% ] 005/600 VUs  0m07.8s/4m00.0s

running (1m14.0s), 006/600 VUs, 22 complete and 0 interrupted iterations
default   [   4% ] 006/600 VUs  0m08.8s/4m00.0s

running (1m15.0s), 007/600 VUs, 28 complete and 0 interrupted iterations
default   [   4% ] 007/600 VUs  0m09.8s/4m00.0s

running (1m16.0s), 007/600 VUs, 34 complete and 0 interrupted iterations
default   [   4% ] 007/600 VUs  0m10.8s/4m00.0s

running (1m17.0s), 008/600 VUs, 40 complete and 0 interrupted iterations
default   [   5% ] 008/600 VUs  0m11.8s/4m00.0s

running (1m18.0s), 009/600 VUs, 47 complete and 0 interrupted iterations
default   [   5% ] 009/600 VUs  0m12.8s/4m00.0s

running (1m19.0s), 009/600 VUs, 55 complete and 0 interrupted iterations
default   [   6% ] 009/600 VUs  0m13.8s/4m00.0s

running (1m20.0s), 010/600 VUs, 63 complete and 0 interrupted iterations
default   [   6% ] 010/600 VUs  0m14.8s/4m00.0s

running (1m21.0s), 010/600 VUs, 71 complete and 0 interrupted iterations
default   [   7% ] 010/600 VUs  0m15.8s/4m00.0s

running (1m22.0s), 011/600 VUs, 81 complete and 0 interrupted iterations
default   [   7% ] 011/600 VUs  0m16.8s/4m00.0s

running (1m23.0s), 012/600 VUs, 90 complete and 0 interrupted iterations
default   [   7% ] 012/600 VUs  0m17.8s/4m00.0s

running (1m24.0s), 012/600 VUs, 101 complete and 0 interrupted iterations
default   [   8% ] 012/600 VUs  0m18.8s/4m00.0s

running (1m25.0s), 013/600 VUs, 112 complete and 0 interrupted iterations
default   [   8% ] 013/600 VUs  0m19.8s/4m00.0s

running (1m26.0s), 014/600 VUs, 123 complete and 0 interrupted iterations
default   [   9% ] 014/600 VUs  0m20.8s/4m00.0s

running (1m27.0s), 014/600 VUs, 136 complete and 0 interrupted iterations
default   [   9% ] 014/600 VUs  0m21.8s/4m00.0s

running (1m28.0s), 015/600 VUs, 147 complete and 0 interrupted iterations
default   [   9% ] 015/600 VUs  0m22.8s/4m00.0s

running (1m29.0s), 016/600 VUs, 160 complete and 0 interrupted iterations
default   [  10% ] 016/600 VUs  0m23.8s/4m00.0s

running (1m30.0s), 016/600 VUs, 174 complete and 0 interrupted iterations
default   [  10% ] 016/600 VUs  0m24.8s/4m00.0s

running (1m31.0s), 017/600 VUs, 188 complete and 0 interrupted iterations
default   [  11% ] 017/600 VUs  0m25.8s/4m00.0s

running (1m32.0s), 017/600 VUs, 203 complete and 0 interrupted iterations
default   [  11% ] 017/600 VUs  0m26.8s/4m00.0s

running (1m33.0s), 018/600 VUs, 219 complete and 0 interrupted iterations
default   [  12% ] 018/600 VUs  0m27.8s/4m00.0s

running (1m34.0s), 019/600 VUs, 235 complete and 0 interrupted iterations
default   [  12% ] 019/600 VUs  0m28.8s/4m00.0s

running (1m35.0s), 019/600 VUs, 251 complete and 0 interrupted iterations
default   [  12% ] 019/600 VUs  0m29.8s/4m00.0s

running (1m36.0s), 020/600 VUs, 268 complete and 0 interrupted iterations
default   [  13% ] 020/600 VUs  0m30.8s/4m00.0s

running (1m37.0s), 021/600 VUs, 284 complete and 0 interrupted iterations
default   [  13% ] 021/600 VUs  0m31.8s/4m00.0s

running (1m38.0s), 022/600 VUs, 304 complete and 0 interrupted iterations
default   [  14% ] 022/600 VUs  0m32.8s/4m00.0s

running (1m39.0s), 023/600 VUs, 323 complete and 0 interrupted iterations
default   [  14% ] 023/600 VUs  0m33.8s/4m00.0s

running (1m40.0s), 024/600 VUs, 344 complete and 0 interrupted iterations
default   [  14% ] 024/600 VUs  0m34.8s/4m00.0s

running (1m41.0s), 025/600 VUs, 367 complete and 0 interrupted iterations
default   [  15% ] 025/600 VUs  0m35.8s/4m00.0s

running (1m42.0s), 026/600 VUs, 388 complete and 0 interrupted iterations
default   [  15% ] 026/600 VUs  0m36.8s/4m00.0s

running (1m43.0s), 027/600 VUs, 410 complete and 0 interrupted iterations
default   [  16% ] 027/600 VUs  0m37.8s/4m00.0s

running (1m44.0s), 028/600 VUs, 434 complete and 0 interrupted iterations
default   [  16% ] 028/600 VUs  0m38.8s/4m00.0s

running (1m45.0s), 029/600 VUs, 457 complete and 0 interrupted iterations
default   [  17% ] 029/600 VUs  0m39.8s/4m00.0s

running (1m46.0s), 030/600 VUs, 484 complete and 0 interrupted iterations
default   [  17% ] 030/600 VUs  0m40.8s/4m00.0s

running (1m47.0s), 031/600 VUs, 512 complete and 0 interrupted iterations
default   [  17% ] 031/600 VUs  0m41.8s/4m00.0s

running (1m48.0s), 032/600 VUs, 538 complete and 0 interrupted iterations
default   [  18% ] 032/600 VUs  0m42.8s/4m00.0s

running (1m49.0s), 033/600 VUs, 568 complete and 0 interrupted iterations
default   [  18% ] 033/600 VUs  0m43.8s/4m00.0s

running (1m50.0s), 034/600 VUs, 596 complete and 0 interrupted iterations
default   [  19% ] 034/600 VUs  0m44.8s/4m00.0s

running (1m51.0s), 035/600 VUs, 625 complete and 0 interrupted iterations
default   [  19% ] 035/600 VUs  0m45.8s/4m00.0s

running (1m52.0s), 036/600 VUs, 656 complete and 0 interrupted iterations
default   [  19% ] 036/600 VUs  0m46.8s/4m00.0s

running (1m53.0s), 037/600 VUs, 686 complete and 0 interrupted iterations
default   [  20% ] 037/600 VUs  0m47.8s/4m00.0s

running (1m54.0s), 038/600 VUs, 722 complete and 0 interrupted iterations
default   [  20% ] 038/600 VUs  0m48.8s/4m00.0s

running (1m55.0s), 039/600 VUs, 756 complete and 0 interrupted iterations
default   [  21% ] 039/600 VUs  0m49.8s/4m00.0s

running (1m56.0s), 040/600 VUs, 789 complete and 0 interrupted iterations
default   [  21% ] 040/600 VUs  0m50.8s/4m00.0s

running (1m57.0s), 041/600 VUs, 821 complete and 0 interrupted iterations
default   [  22% ] 041/600 VUs  0m51.8s/4m00.0s

running (1m58.0s), 042/600 VUs, 860 complete and 0 interrupted iterations
default   [  22% ] 042/600 VUs  0m52.8s/4m00.0s

running (1m59.0s), 043/600 VUs, 897 complete and 0 interrupted iterations
default   [  22% ] 043/600 VUs  0m53.8s/4m00.0s

running (2m00.0s), 044/600 VUs, 935 complete and 0 interrupted iterations
default   [  23% ] 044/600 VUs  0m54.8s/4m00.0s

running (2m01.0s), 045/600 VUs, 971 complete and 0 interrupted iterations
default   [  23% ] 045/600 VUs  0m55.8s/4m00.0s

running (2m02.0s), 046/600 VUs, 1014 complete and 0 interrupted iterations
default   [  24% ] 046/600 VUs  0m56.8s/4m00.0s

running (2m03.0s), 047/600 VUs, 1053 complete and 0 interrupted iterations
default   [  24% ] 047/600 VUs  0m57.8s/4m00.0s

running (2m04.0s), 048/600 VUs, 1095 complete and 0 interrupted iterations
default   [  24% ] 048/600 VUs  0m58.8s/4m00.0s

running (2m05.0s), 049/600 VUs, 1135 complete and 0 interrupted iterations
default   [  25% ] 049/600 VUs  0m59.8s/4m00.0s

running (2m06.0s), 051/600 VUs, 1180 complete and 0 interrupted iterations
default   [  25% ] 051/600 VUs  1m00.8s/4m00.0s

running (2m07.0s), 052/600 VUs, 1220 complete and 0 interrupted iterations
default   [  26% ] 052/600 VUs  1m01.8s/4m00.0s

running (2m08.0s), 054/600 VUs, 1262 complete and 0 interrupted iterations
default   [  26% ] 054/600 VUs  1m02.8s/4m00.0s

running (2m09.0s), 056/600 VUs, 1315 complete and 0 interrupted iterations
default   [  27% ] 056/600 VUs  1m03.8s/4m00.0s

running (2m10.0s), 057/600 VUs, 1368 complete and 0 interrupted iterations
default   [  27% ] 057/600 VUs  1m04.8s/4m00.0s

running (2m11.0s), 059/600 VUs, 1415 complete and 0 interrupted iterations
default   [  27% ] 059/600 VUs  1m05.8s/4m00.0s

running (2m12.0s), 061/600 VUs, 1461 complete and 0 interrupted iterations
default   [  28% ] 061/600 VUs  1m06.8s/4m00.0s

running (2m13.0s), 062/600 VUs, 1520 complete and 0 interrupted iterations
default   [  28% ] 062/600 VUs  1m07.8s/4m00.0s

running (2m14.0s), 064/600 VUs, 1570 complete and 0 interrupted iterations
default   [  29% ] 064/600 VUs  1m08.8s/4m00.0s

running (2m15.0s), 066/600 VUs, 1628 complete and 0 interrupted iterations
default   [  29% ] 066/600 VUs  1m09.8s/4m00.0s

running (2m16.0s), 067/600 VUs, 1682 complete and 0 interrupted iterations
default   [  29% ] 067/600 VUs  1m10.8s/4m00.0s

running (2m17.0s), 069/600 VUs, 1746 complete and 0 interrupted iterations
default   [  30% ] 069/600 VUs  1m11.8s/4m00.0s

running (2m18.0s), 071/600 VUs, 1809 complete and 0 interrupted iterations
default   [  30% ] 071/600 VUs  1m12.8s/4m00.0s

running (2m19.0s), 072/600 VUs, 1859 complete and 0 interrupted iterations
default   [  31% ] 072/600 VUs  1m13.8s/4m00.0s

running (2m20.0s), 074/600 VUs, 1927 complete and 0 interrupted iterations
default   [  31% ] 074/600 VUs  1m14.8s/4m00.0s

running (2m21.0s), 076/600 VUs, 1992 complete and 0 interrupted iterations
default   [  32% ] 076/600 VUs  1m15.8s/4m00.0s

running (2m22.0s), 077/600 VUs, 2058 complete and 0 interrupted iterations
default   [  32% ] 077/600 VUs  1m16.8s/4m00.0s

running (2m23.0s), 079/600 VUs, 2129 complete and 0 interrupted iterations
default   [  32% ] 079/600 VUs  1m17.8s/4m00.0s

running (2m24.0s), 081/600 VUs, 2193 complete and 0 interrupted iterations
default   [  33% ] 081/600 VUs  1m18.8s/4m00.0s

running (2m25.0s), 082/600 VUs, 2271 complete and 0 interrupted iterations
default   [  33% ] 082/600 VUs  1m19.8s/4m00.0s

running (2m26.0s), 084/600 VUs, 2335 complete and 0 interrupted iterations
default   [  34% ] 084/600 VUs  1m20.8s/4m00.0s

running (2m27.0s), 086/600 VUs, 2405 complete and 0 interrupted iterations
default   [  34% ] 086/600 VUs  1m21.8s/4m00.0s

running (2m28.0s), 087/600 VUs, 2485 complete and 0 interrupted iterations
default   [  34% ] 087/600 VUs  1m22.8s/4m00.0s

running (2m29.0s), 089/600 VUs, 2556 complete and 0 interrupted iterations
default   [  35% ] 089/600 VUs  1m23.8s/4m00.0s

running (2m30.0s), 091/600 VUs, 2634 complete and 0 interrupted iterations
default   [  35% ] 091/600 VUs  1m24.8s/4m00.0s

running (2m31.0s), 092/600 VUs, 2719 complete and 0 interrupted iterations
default   [  36% ] 092/600 VUs  1m25.8s/4m00.0s

running (2m32.0s), 094/600 VUs, 2798 complete and 0 interrupted iterations
default   [  36% ] 094/600 VUs  1m26.8s/4m00.0s

running (2m33.0s), 096/600 VUs, 2887 complete and 0 interrupted iterations
default   [  37% ] 096/600 VUs  1m27.8s/4m00.0s

running (2m34.0s), 097/600 VUs, 2960 complete and 0 interrupted iterations
default   [  37% ] 097/600 VUs  1m28.8s/4m00.0s

running (2m35.0s), 099/600 VUs, 3044 complete and 0 interrupted iterations
default   [  37% ] 099/600 VUs  1m29.8s/4m00.0s

running (2m36.0s), 102/600 VUs, 3124 complete and 0 interrupted iterations
default   [  38% ] 102/600 VUs  1m30.8s/4m00.0s

running (2m37.0s), 105/600 VUs, 3222 complete and 0 interrupted iterations
default   [  38% ] 105/600 VUs  1m31.8s/4m00.0s

running (2m38.0s), 109/600 VUs, 3315 complete and 0 interrupted iterations
default   [  39% ] 109/600 VUs  1m32.8s/4m00.0s

running (2m39.0s), 112/600 VUs, 3408 complete and 0 interrupted iterations
default   [  39% ] 112/600 VUs  1m33.8s/4m00.0s

running (2m40.0s), 115/600 VUs, 3510 complete and 0 interrupted iterations
default   [  39% ] 115/600 VUs  1m34.8s/4m00.0s

running (2m41.0s), 119/600 VUs, 3601 complete and 0 interrupted iterations
default   [  40% ] 119/600 VUs  1m35.8s/4m00.0s

running (2m42.0s), 122/600 VUs, 3698 complete and 0 interrupted iterations
default   [  40% ] 122/600 VUs  1m36.8s/4m00.0s

running (2m43.0s), 125/600 VUs, 3806 complete and 0 interrupted iterations
default   [  41% ] 125/600 VUs  1m37.8s/4m00.0s

running (2m44.0s), 129/600 VUs, 3918 complete and 0 interrupted iterations
default   [  41% ] 129/600 VUs  1m38.8s/4m00.0s

running (2m45.0s), 132/600 VUs, 4030 complete and 0 interrupted iterations
default   [  42% ] 132/600 VUs  1m39.8s/4m00.0s

running (2m46.0s), 135/600 VUs, 4148 complete and 0 interrupted iterations
default   [  42% ] 135/600 VUs  1m40.8s/4m00.0s

running (2m47.0s), 139/600 VUs, 4267 complete and 0 interrupted iterations
default   [  42% ] 139/600 VUs  1m41.8s/4m00.0s

running (2m48.0s), 142/600 VUs, 4381 complete and 0 interrupted iterations
default   [  43% ] 142/600 VUs  1m42.8s/4m00.0s

running (2m49.0s), 145/600 VUs, 4494 complete and 0 interrupted iterations
default   [  43% ] 145/600 VUs  1m43.8s/4m00.0s

running (2m50.0s), 149/600 VUs, 4622 complete and 0 interrupted iterations
default   [  44% ] 149/600 VUs  1m44.8s/4m00.0s

running (2m51.0s), 152/600 VUs, 4755 complete and 0 interrupted iterations
default   [  44% ] 152/600 VUs  1m45.8s/4m00.0s

running (2m52.0s), 155/600 VUs, 4889 complete and 0 interrupted iterations
default   [  44% ] 155/600 VUs  1m46.8s/4m00.0s
time="2026-05-28T18:05:07-03:00" level=warning msg="The test has generated metrics with 100107 unique time series, which is higher than the suggested limit of 100000 and could cause high memory usage. Consider not using high-cardinality values like unique IDs as metric tags or, if you need them in the URL, use the name metric tag or URL grouping. See https://grafana.com/docs/k6/latest/using-k6/tags-and-groups/ for details." component=metrics-engine-ingester

running (2m53.0s), 159/600 VUs, 5029 complete and 0 interrupted iterations
default   [  45% ] 159/600 VUs  1m47.8s/4m00.0s

running (2m54.0s), 162/600 VUs, 5160 complete and 0 interrupted iterations
default   [  45% ] 162/600 VUs  1m48.8s/4m00.0s

running (2m55.0s), 165/600 VUs, 5303 complete and 0 interrupted iterations
default   [  46% ] 165/600 VUs  1m49.8s/4m00.0s

running (2m56.0s), 169/600 VUs, 5438 complete and 0 interrupted iterations
default   [  46% ] 169/600 VUs  1m50.8s/4m00.0s

running (2m57.0s), 172/600 VUs, 5579 complete and 0 interrupted iterations
default   [  47% ] 172/600 VUs  1m51.8s/4m00.0s

running (2m58.0s), 175/600 VUs, 5732 complete and 0 interrupted iterations
default   [  47% ] 175/600 VUs  1m52.8s/4m00.0s

running (2m59.0s), 179/600 VUs, 5887 complete and 0 interrupted iterations
default   [  47% ] 179/600 VUs  1m53.8s/4m00.0s

running (3m00.0s), 182/600 VUs, 6039 complete and 0 interrupted iterations
default   [  48% ] 182/600 VUs  1m54.8s/4m00.0s

running (3m01.0s), 185/600 VUs, 6196 complete and 0 interrupted iterations
default   [  48% ] 185/600 VUs  1m55.8s/4m00.0s

running (3m02.0s), 189/600 VUs, 6349 complete and 0 interrupted iterations
default   [  49% ] 189/600 VUs  1m56.8s/4m00.0s

running (3m03.0s), 192/600 VUs, 6504 complete and 0 interrupted iterations
default   [  49% ] 192/600 VUs  1m57.8s/4m00.0s

running (3m04.0s), 195/600 VUs, 6667 complete and 0 interrupted iterations
default   [  49% ] 195/600 VUs  1m58.8s/4m00.0s

running (3m05.0s), 199/600 VUs, 6842 complete and 0 interrupted iterations
default   [  50% ] 199/600 VUs  1m59.8s/4m00.0s

running (3m06.0s), 202/600 VUs, 7017 complete and 0 interrupted iterations
default   [  50% ] 202/600 VUs  2m00.8s/4m00.0s

running (3m07.0s), 205/600 VUs, 7189 complete and 0 interrupted iterations
default   [  51% ] 205/600 VUs  2m01.8s/4m00.0s

running (3m08.0s), 209/600 VUs, 7367 complete and 0 interrupted iterations
default   [  51% ] 209/600 VUs  2m02.8s/4m00.0s

running (3m09.0s), 212/600 VUs, 7542 complete and 0 interrupted iterations
default   [  52% ] 212/600 VUs  2m03.8s/4m00.0s

running (3m10.0s), 215/600 VUs, 7719 complete and 0 interrupted iterations
default   [  52% ] 215/600 VUs  2m04.8s/4m00.0s

running (3m11.0s), 219/600 VUs, 7901 complete and 0 interrupted iterations
default   [  52% ] 219/600 VUs  2m05.8s/4m00.0s

running (3m12.0s), 222/600 VUs, 8094 complete and 0 interrupted iterations
default   [  53% ] 222/600 VUs  2m06.8s/4m00.0s

running (3m13.0s), 225/600 VUs, 8278 complete and 0 interrupted iterations
default   [  53% ] 225/600 VUs  2m07.8s/4m00.0s

running (3m14.0s), 229/600 VUs, 8477 complete and 0 interrupted iterations
default   [  54% ] 229/600 VUs  2m08.8s/4m00.0s

running (3m15.0s), 232/600 VUs, 8664 complete and 0 interrupted iterations
default   [  54% ] 232/600 VUs  2m09.8s/4m00.0s

running (3m16.0s), 235/600 VUs, 8862 complete and 0 interrupted iterations
default   [  54% ] 235/600 VUs  2m10.8s/4m00.0s

running (3m17.0s), 239/600 VUs, 9045 complete and 0 interrupted iterations
default   [  55% ] 239/600 VUs  2m11.8s/4m00.0s

running (3m18.0s), 242/600 VUs, 9258 complete and 0 interrupted iterations
default   [  55% ] 242/600 VUs  2m12.8s/4m00.0s

running (3m19.0s), 245/600 VUs, 9459 complete and 0 interrupted iterations
default   [  56% ] 245/600 VUs  2m13.8s/4m00.0s

running (3m20.0s), 249/600 VUs, 9671 complete and 0 interrupted iterations
default   [  56% ] 249/600 VUs  2m14.8s/4m00.0s

running (3m21.0s), 252/600 VUs, 9871 complete and 0 interrupted iterations
default   [  57% ] 252/600 VUs  2m15.8s/4m00.0s

running (3m22.0s), 255/600 VUs, 10101 complete and 0 interrupted iterations
default   [  57% ] 255/600 VUs  2m16.8s/4m00.0s

running (3m23.0s), 259/600 VUs, 10303 complete and 0 interrupted iterations
default   [  57% ] 259/600 VUs  2m17.8s/4m00.0s
time="2026-05-28T18:05:38-03:00" level=warning msg="The test has generated metrics with 200367 unique time series, which is higher than the suggested limit of 100000 and could cause high memory usage. Consider not using high-cardinality values like unique IDs as metric tags or, if you need them in the URL, use the name metric tag or URL grouping. See https://grafana.com/docs/k6/latest/using-k6/tags-and-groups/ for details." component=metrics-engine-ingester

running (3m24.0s), 262/600 VUs, 10526 complete and 0 interrupted iterations
default   [  58% ] 262/600 VUs  2m18.8s/4m00.0s

running (3m25.0s), 265/600 VUs, 10740 complete and 0 interrupted iterations
default   [  58% ] 265/600 VUs  2m19.8s/4m00.0s

running (3m26.0s), 269/600 VUs, 10968 complete and 0 interrupted iterations
default   [  59% ] 269/600 VUs  2m20.8s/4m00.0s

running (3m27.0s), 272/600 VUs, 11184 complete and 0 interrupted iterations
default   [  59% ] 272/600 VUs  2m21.8s/4m00.0s

running (3m28.0s), 275/600 VUs, 11428 complete and 0 interrupted iterations
default   [  59% ] 275/600 VUs  2m22.8s/4m00.0s

running (3m29.0s), 279/600 VUs, 11637 complete and 0 interrupted iterations
default   [  60% ] 279/600 VUs  2m23.8s/4m00.0s

running (3m30.0s), 282/600 VUs, 11876 complete and 0 interrupted iterations
default   [  60% ] 282/600 VUs  2m24.8s/4m00.0s

running (3m31.0s), 285/600 VUs, 12079 complete and 0 interrupted iterations
default   [  61% ] 285/600 VUs  2m25.8s/4m00.0s

running (3m32.0s), 289/600 VUs, 12319 complete and 0 interrupted iterations
default   [  61% ] 289/600 VUs  2m26.8s/4m00.0s

running (3m33.0s), 292/600 VUs, 12560 complete and 0 interrupted iterations
default   [  62% ] 292/600 VUs  2m27.8s/4m00.0s

running (3m34.0s), 295/600 VUs, 12778 complete and 0 interrupted iterations
default   [  62% ] 295/600 VUs  2m28.8s/4m00.0s

running (3m35.0s), 299/600 VUs, 13034 complete and 0 interrupted iterations
default   [  62% ] 299/600 VUs  2m29.8s/4m00.0s

running (3m36.0s), 302/600 VUs, 13256 complete and 0 interrupted iterations
default   [  63% ] 302/600 VUs  2m30.8s/4m00.0s

running (3m37.0s), 305/600 VUs, 13488 complete and 0 interrupted iterations
default   [  63% ] 305/600 VUs  2m31.8s/4m00.0s

running (3m38.0s), 309/600 VUs, 13738 complete and 0 interrupted iterations
default   [  64% ] 309/600 VUs  2m32.8s/4m00.0s

running (3m39.0s), 312/600 VUs, 13970 complete and 0 interrupted iterations
default   [  64% ] 312/600 VUs  2m33.8s/4m00.0s

running (3m40.0s), 315/600 VUs, 14206 complete and 0 interrupted iterations
default   [  64% ] 315/600 VUs  2m34.8s/4m00.0s

running (3m41.0s), 319/600 VUs, 14457 complete and 0 interrupted iterations
default   [  65% ] 319/600 VUs  2m35.8s/4m00.0s

running (3m42.0s), 322/600 VUs, 14716 complete and 0 interrupted iterations
default   [  65% ] 322/600 VUs  2m36.8s/4m00.0s

running (3m43.0s), 325/600 VUs, 14949 complete and 0 interrupted iterations
default   [  66% ] 325/600 VUs  2m37.8s/4m00.0s

running (3m44.0s), 329/600 VUs, 15191 complete and 0 interrupted iterations
default   [  66% ] 329/600 VUs  2m38.8s/4m00.0s

running (3m45.0s), 332/600 VUs, 15418 complete and 0 interrupted iterations
default   [  67% ] 332/600 VUs  2m39.8s/4m00.0s

running (3m46.0s), 335/600 VUs, 15683 complete and 0 interrupted iterations
default   [  67% ] 335/600 VUs  2m40.8s/4m00.0s

running (3m47.0s), 339/600 VUs, 15936 complete and 0 interrupted iterations
default   [  67% ] 339/600 VUs  2m41.8s/4m00.0s

running (3m48.0s), 342/600 VUs, 16167 complete and 0 interrupted iterations
default   [  68% ] 342/600 VUs  2m42.8s/4m00.0s

running (3m49.0s), 345/600 VUs, 16433 complete and 0 interrupted iterations
default   [  68% ] 345/600 VUs  2m43.8s/4m00.0s

running (3m50.0s), 349/600 VUs, 16699 complete and 0 interrupted iterations
default   [  69% ] 349/600 VUs  2m44.8s/4m00.0s

running (3m51.0s), 352/600 VUs, 16944 complete and 0 interrupted iterations
default   [  69% ] 352/600 VUs  2m45.8s/4m00.0s

running (3m52.0s), 355/600 VUs, 17201 complete and 0 interrupted iterations
default   [  69% ] 355/600 VUs  2m46.8s/4m00.0s

running (3m53.0s), 359/600 VUs, 17460 complete and 0 interrupted iterations
default   [  70% ] 359/600 VUs  2m47.8s/4m00.0s

running (3m54.0s), 362/600 VUs, 17719 complete and 0 interrupted iterations
default   [  70% ] 362/600 VUs  2m48.8s/4m00.0s

running (3m55.0s), 365/600 VUs, 17986 complete and 0 interrupted iterations
default   [  71% ] 365/600 VUs  2m49.8s/4m00.0s

running (3m56.0s), 369/600 VUs, 18236 complete and 0 interrupted iterations
default   [  71% ] 369/600 VUs  2m50.8s/4m00.0s

running (3m57.0s), 372/600 VUs, 18499 complete and 0 interrupted iterations
default   [  72% ] 372/600 VUs  2m51.8s/4m00.0s

running (3m58.0s), 375/600 VUs, 18764 complete and 0 interrupted iterations
default   [  72% ] 375/600 VUs  2m52.8s/4m00.0s

running (3m59.0s), 379/600 VUs, 19023 complete and 0 interrupted iterations
default   [  72% ] 379/600 VUs  2m53.8s/4m00.0s

running (4m00.0s), 382/600 VUs, 19280 complete and 0 interrupted iterations
default   [  73% ] 382/600 VUs  2m54.8s/4m00.0s

running (4m01.0s), 385/600 VUs, 19508 complete and 0 interrupted iterations
default   [  73% ] 385/600 VUs  2m55.8s/4m00.0s

running (4m02.0s), 389/600 VUs, 19771 complete and 0 interrupted iterations
default   [  74% ] 389/600 VUs  2m56.8s/4m00.0s

running (4m03.0s), 392/600 VUs, 20001 complete and 0 interrupted iterations
default   [  74% ] 392/600 VUs  2m57.8s/4m00.0s

running (4m04.0s), 395/600 VUs, 20253 complete and 0 interrupted iterations
default   [  74% ] 395/600 VUs  2m58.8s/4m00.0s

running (4m05.0s), 399/600 VUs, 20506 complete and 0 interrupted iterations
default   [  75% ] 399/600 VUs  2m59.8s/4m00.0s

running (4m06.0s), 405/600 VUs, 20772 complete and 0 interrupted iterations
default   [  75% ] 405/600 VUs  3m00.8s/4m00.0s

running (4m07.0s), 411/600 VUs, 21022 complete and 0 interrupted iterations
default   [  76% ] 411/600 VUs  3m01.8s/4m00.0s
time="2026-05-28T18:06:22-03:00" level=warning msg="The test has generated metrics with 400275 unique time series, which is higher than the suggested limit of 100000 and could cause high memory usage. Consider not using high-cardinality values like unique IDs as metric tags or, if you need them in the URL, use the name metric tag or URL grouping. See https://grafana.com/docs/k6/latest/using-k6/tags-and-groups/ for details." component=metrics-engine-ingester

running (4m08.0s), 418/600 VUs, 21279 complete and 0 interrupted iterations
default   [  76% ] 418/600 VUs  3m02.8s/4m00.0s

running (4m09.0s), 425/600 VUs, 21556 complete and 0 interrupted iterations
default   [  77% ] 425/600 VUs  3m03.8s/4m00.0s

running (4m10.0s), 431/600 VUs, 21825 complete and 0 interrupted iterations
default   [  77% ] 431/600 VUs  3m04.8s/4m00.0s

running (4m10.9s), 438/600 VUs, 22077 complete and 0 interrupted iterations
default   [  77% ] 438/600 VUs  3m05.8s/4m00.0s

running (4m11.9s), 445/600 VUs, 22272 complete and 0 interrupted iterations
default   [  78% ] 445/600 VUs  3m06.8s/4m00.0s

running (4m12.9s), 451/600 VUs, 22548 complete and 0 interrupted iterations
default   [  78% ] 451/600 VUs  3m07.8s/4m00.0s

running (4m13.9s), 458/600 VUs, 22788 complete and 0 interrupted iterations
default   [  79% ] 458/600 VUs  3m08.8s/4m00.0s

running (4m14.9s), 465/600 VUs, 23070 complete and 0 interrupted iterations
default   [  79% ] 465/600 VUs  3m09.8s/4m00.0s

running (4m15.9s), 471/600 VUs, 23297 complete and 0 interrupted iterations
default   [  79% ] 471/600 VUs  3m10.8s/4m00.0s

running (4m16.9s), 478/600 VUs, 23580 complete and 0 interrupted iterations
default   [  80% ] 478/600 VUs  3m11.8s/4m00.0s

running (4m17.9s), 485/600 VUs, 23800 complete and 0 interrupted iterations
default   [  80% ] 485/600 VUs  3m12.8s/4m00.0s

running (4m18.9s), 491/600 VUs, 24063 complete and 0 interrupted iterations
default   [  81% ] 491/600 VUs  3m13.8s/4m00.0s

running (4m19.9s), 498/600 VUs, 24321 complete and 0 interrupted iterations
default   [  81% ] 498/600 VUs  3m14.8s/4m00.0s

running (4m20.9s), 505/600 VUs, 24614 complete and 0 interrupted iterations
default   [  82% ] 505/600 VUs  3m15.8s/4m00.0s

running (4m21.9s), 511/600 VUs, 24848 complete and 0 interrupted iterations
default   [  82% ] 511/600 VUs  3m16.8s/4m00.0s

running (4m22.9s), 518/600 VUs, 25103 complete and 0 interrupted iterations
default   [  82% ] 518/600 VUs  3m17.8s/4m00.0s

running (4m23.9s), 525/600 VUs, 25338 complete and 0 interrupted iterations
default   [  83% ] 525/600 VUs  3m18.8s/4m00.0s

running (4m24.9s), 531/600 VUs, 25626 complete and 0 interrupted iterations
default   [  83% ] 531/600 VUs  3m19.8s/4m00.0s

running (4m25.9s), 538/600 VUs, 25871 complete and 0 interrupted iterations
default   [  84% ] 538/600 VUs  3m20.8s/4m00.0s

running (4m26.9s), 545/600 VUs, 26149 complete and 0 interrupted iterations
default   [  84% ] 545/600 VUs  3m21.8s/4m00.0s

running (4m27.9s), 551/600 VUs, 26417 complete and 0 interrupted iterations
default   [  84% ] 551/600 VUs  3m22.8s/4m00.0s

running (4m28.9s), 558/600 VUs, 26672 complete and 0 interrupted iterations
default   [  85% ] 558/600 VUs  3m23.8s/4m00.0s

running (4m29.9s), 565/600 VUs, 26939 complete and 0 interrupted iterations
default   [  85% ] 565/600 VUs  3m24.8s/4m00.0s

running (4m30.9s), 571/600 VUs, 27185 complete and 0 interrupted iterations
default   [  86% ] 571/600 VUs  3m25.8s/4m00.0s

running (4m31.9s), 578/600 VUs, 27486 complete and 0 interrupted iterations
default   [  86% ] 578/600 VUs  3m26.8s/4m00.0s

running (4m32.9s), 585/600 VUs, 27750 complete and 0 interrupted iterations
default   [  87% ] 585/600 VUs  3m27.8s/4m00.0s

running (4m33.9s), 591/600 VUs, 28010 complete and 0 interrupted iterations
default   [  87% ] 591/600 VUs  3m28.8s/4m00.0s

running (4m34.9s), 598/600 VUs, 28269 complete and 0 interrupted iterations
default   [  87% ] 598/600 VUs  3m29.8s/4m00.0s

running (4m35.9s), 597/600 VUs, 28553 complete and 0 interrupted iterations
default   [  88% ] 597/600 VUs  3m30.8s/4m00.0s

running (4m36.9s), 585/600 VUs, 28803 complete and 0 interrupted iterations
default   [  88% ] 585/600 VUs  3m31.8s/4m00.0s

running (4m37.9s), 567/600 VUs, 29124 complete and 0 interrupted iterations
default   [  89% ] 567/600 VUs  3m32.8s/4m00.0s

running (4m38.9s), 551/600 VUs, 29345 complete and 0 interrupted iterations
default   [  89% ] 551/600 VUs  3m33.8s/4m00.0s

running (4m39.9s), 530/600 VUs, 29573 complete and 0 interrupted iterations
default   [  89% ] 530/600 VUs  3m34.8s/4m00.0s

running (4m40.9s), 500/600 VUs, 29888 complete and 0 interrupted iterations
default   [  90% ] 500/600 VUs  3m35.8s/4m00.0s

running (4m41.9s), 485/600 VUs, 30134 complete and 0 interrupted iterations
default   [  90% ] 485/600 VUs  3m36.8s/4m00.0s

running (4m42.9s), 462/600 VUs, 30443 complete and 0 interrupted iterations
default   [  91% ] 462/600 VUs  3m37.8s/4m00.0s

running (4m43.9s), 445/600 VUs, 30689 complete and 0 interrupted iterations
default   [  91% ] 445/600 VUs  3m38.8s/4m00.0s

running (4m44.9s), 421/600 VUs, 30970 complete and 0 interrupted iterations
default   [  92% ] 421/600 VUs  3m39.8s/4m00.0s

running (4m45.9s), 400/600 VUs, 31236 complete and 0 interrupted iterations
default   [  92% ] 400/600 VUs  3m40.8s/4m00.0s

running (4m46.9s), 377/600 VUs, 31497 complete and 0 interrupted iterations
default   [  92% ] 377/600 VUs  3m41.8s/4m00.0s

running (4m47.9s), 357/600 VUs, 31786 complete and 0 interrupted iterations
default   [  93% ] 357/600 VUs  3m42.8s/4m00.0s

running (4m48.9s), 338/600 VUs, 32046 complete and 0 interrupted iterations
default   [  93% ] 338/600 VUs  3m43.8s/4m00.0s

running (4m49.9s), 319/600 VUs, 32301 complete and 0 interrupted iterations
default   [  94% ] 319/600 VUs  3m44.8s/4m00.0s

running (4m50.9s), 300/600 VUs, 32566 complete and 0 interrupted iterations
default   [  94% ] 300/600 VUs  3m45.8s/4m00.0s

running (4m51.9s), 278/600 VUs, 32818 complete and 0 interrupted iterations
default   [  94% ] 278/600 VUs  3m46.8s/4m00.0s

running (4m52.9s), 257/600 VUs, 33055 complete and 0 interrupted iterations
default   [  95% ] 257/600 VUs  3m47.8s/4m00.0s

running (4m53.9s), 237/600 VUs, 33249 complete and 0 interrupted iterations
default   [  95% ] 237/600 VUs  3m48.8s/4m00.0s

running (4m54.9s), 217/600 VUs, 33460 complete and 0 interrupted iterations
default   [  96% ] 217/600 VUs  3m49.8s/4m00.0s

running (4m55.9s), 198/600 VUs, 33648 complete and 0 interrupted iterations
default   [  96% ] 198/600 VUs  3m50.8s/4m00.0s

running (4m56.9s), 172/600 VUs, 33826 complete and 0 interrupted iterations
default   [  97% ] 172/600 VUs  3m51.8s/4m00.0s

running (4m57.9s), 152/600 VUs, 33972 complete and 0 interrupted iterations
default   [  97% ] 152/600 VUs  3m52.8s/4m00.0s

running (4m58.9s), 137/600 VUs, 34103 complete and 0 interrupted iterations
default   [  97% ] 137/600 VUs  3m53.8s/4m00.0s

running (4m59.9s), 118/600 VUs, 34216 complete and 0 interrupted iterations
default   [  98% ] 118/600 VUs  3m54.8s/4m00.0s

running (5m00.9s), 097/600 VUs, 34318 complete and 0 interrupted iterations
default   [  98% ] 097/600 VUs  3m55.8s/4m00.0s

running (5m01.9s), 080/600 VUs, 34406 complete and 0 interrupted iterations
default   [  99% ] 080/600 VUs  3m56.8s/4m00.0s

running (5m02.9s), 056/600 VUs, 34480 complete and 0 interrupted iterations
default   [  99% ] 056/600 VUs  3m57.8s/4m00.0s

running (5m03.9s), 036/600 VUs, 34528 complete and 0 interrupted iterations
default   [  99% ] 036/600 VUs  3m58.8s/4m00.0s

running (5m04.9s), 016/600 VUs, 34562 complete and 0 interrupted iterations
default   [ 100% ] 016/600 VUs  3m59.8s/4m00.0s

running (5m05.9s), 004/600 VUs, 34575 complete and 0 interrupted iterations
default ↓ [ 100% ] 013/600 VUs  4m0s


  █ THRESHOLDS 

    http_req_duration
    ✓ 'p(95)<2000' p(95)=291.99ms

    http_req_failed
    ✓ 'rate<0.05' rate=0.00%


  █ TOTAL RESULTS 

    checks_total.......: 176895  577.762651/s
    checks_succeeded...: 100.00% 176895 out of 176895
    checks_failed......: 0.00%   0 out of 176895

    ✓ register 201
    ✓ login 200
    ✓ shelf created 201
    ✓ book added to shelf 201
    ✓ review base 201
    ✓ list 200
    ✓ create 201
    ✓ create retorna id
    ✓ get 200
    ✓ delete 204

    HTTP
    http_req_duration..............: avg=87.42ms min=3.23ms med=43.44ms max=991.14ms p(90)=228.26ms p(95)=291.99ms
      { expected_response:true }...: avg=87.42ms min=3.23ms med=43.44ms max=991.14ms p(90)=228.26ms p(95)=291.99ms
    http_req_failed................: 0.00%  0 out of 142316
    http_reqs......................: 142316 464.823027/s

    EXECUTION
    iteration_duration.............: avg=1.45s   min=1.12s  med=1.3s    max=2.9s     p(90)=2.04s    p(95)=2.17s   
    iterations.....................: 34579  112.939624/s
    vus............................: 4      min=0           max=598
    vus_max........................: 600    min=600         max=600

    NETWORK
    data_received..................: 72 MB  236 kB/s
    data_sent......................: 63 MB  205 kB/s




running (5m06.2s), 000/600 VUs, 34579 complete and 0 interrupted iterations
default ✓ [ 100% ] 000/600 VUs  4m0s

================================================================
% cd DomainFeed/commentInteraction && k6 run commentInteraction-load.js
================================================================


         /\      Grafana   /‾‾/  
    /\  /  \     |\  __   /  /   
   /  \/    \    | |/ /  /   ‾‾\ 
  /          \   |   (  |  (‾)  |
 / __________ \  |_|\_\  \_____/ 


     execution: local
        script: commentInteraction-load.js
        output: -

     scenarios: (100.00%) 2 scenarios, 210 max VUs, 2m30s max duration (incl. graceful stop):
              * crud: 150 looping VUs for 2m0s (exec: crudInteractions, gracefulStop: 30s)
              * listing: 60 looping VUs for 2m0s (exec: listReplies, gracefulStop: 30s)


Run       [ 100% ] setup()
crud      [   0% ]
listing   [   0% ]

Run       [ 100% ] setup()
crud      [   0% ]
listing   [   0% ]

Run       [ 100% ] setup()
crud      [   0% ]
listing   [   0% ]

Run       [ 100% ] setup()
crud      [   0% ]
listing   [   0% ]

Run       [ 100% ] setup()
crud      [   0% ]
listing   [   0% ]

Run       [ 100% ] setup()
crud      [   0% ]
listing   [   0% ]

Run       [ 100% ] setup()
crud      [   0% ]
listing   [   0% ]

Run       [ 100% ] setup()
crud      [   0% ]
listing   [   0% ]

Run       [ 100% ] setup()
crud      [   0% ]
listing   [   0% ]

Run       [ 100% ] setup()
crud      [   0% ]
listing   [   0% ]

Run       [ 100% ] setup()
crud      [   0% ]
listing   [   0% ]

Run       [ 100% ] setup()
crud      [   0% ]
listing   [   0% ]

Run       [ 100% ] setup()
crud      [   0% ]
listing   [   0% ]

Run       [ 100% ] setup()
crud      [   0% ]
listing   [   0% ]

Run       [ 100% ] setup()
crud      [   0% ]
listing   [   0% ]

Run       [ 100% ] setup()
crud      [   0% ]
listing   [   0% ]

Run       [ 100% ] setup()
crud      [   0% ]
listing   [   0% ]

Run       [ 100% ] setup()
crud      [   0% ]
listing   [   0% ]

Run       [ 100% ] setup()
crud      [   0% ]
listing   [   0% ]

Run       [ 100% ] setup()
crud      [   0% ]
listing   [   0% ]

Run       [ 100% ] setup()
crud      [   0% ]
listing   [   0% ]

running (0m22.0s), 210/210 VUs, 0 complete and 0 interrupted iterations
crud      [   0% ] 150 VUs  0m00.3s/2m0s
listing   [   0% ] 60 VUs   0m00.3s/2m0s

running (0m23.0s), 210/210 VUs, 120 complete and 0 interrupted iterations
crud      [   1% ] 150 VUs  0m01.3s/2m0s
listing   [   1% ] 60 VUs   0m01.3s/2m0s

running (0m24.0s), 210/210 VUs, 373 complete and 0 interrupted iterations
crud      [   2% ] 150 VUs  0m02.3s/2m0s
listing   [   2% ] 60 VUs   0m02.3s/2m0s

running (0m25.0s), 210/210 VUs, 497 complete and 0 interrupted iterations
crud      [   3% ] 150 VUs  0m03.3s/2m0s
listing   [   3% ] 60 VUs   0m03.3s/2m0s

running (0m26.0s), 210/210 VUs, 748 complete and 0 interrupted iterations
crud      [   4% ] 150 VUs  0m04.3s/2m0s
listing   [   4% ] 60 VUs   0m04.3s/2m0s

running (0m27.0s), 210/210 VUs, 880 complete and 0 interrupted iterations
crud      [   4% ] 150 VUs  0m05.3s/2m0s
listing   [   4% ] 60 VUs   0m05.3s/2m0s

running (0m28.0s), 210/210 VUs, 1121 complete and 0 interrupted iterations
crud      [   5% ] 150 VUs  0m06.3s/2m0s
listing   [   5% ] 60 VUs   0m06.3s/2m0s

running (0m29.0s), 210/210 VUs, 1253 complete and 0 interrupted iterations
crud      [   6% ] 150 VUs  0m07.3s/2m0s
listing   [   6% ] 60 VUs   0m07.3s/2m0s

running (0m30.0s), 210/210 VUs, 1498 complete and 0 interrupted iterations
crud      [   7% ] 150 VUs  0m08.3s/2m0s
listing   [   7% ] 60 VUs   0m08.3s/2m0s

running (0m31.0s), 210/210 VUs, 1628 complete and 0 interrupted iterations
crud      [   8% ] 150 VUs  0m09.3s/2m0s
listing   [   8% ] 60 VUs   0m09.3s/2m0s

running (0m32.0s), 210/210 VUs, 1885 complete and 0 interrupted iterations
crud      [   9% ] 150 VUs  0m10.3s/2m0s
listing   [   9% ] 60 VUs   0m10.3s/2m0s

running (0m33.0s), 210/210 VUs, 2010 complete and 0 interrupted iterations
crud      [   9% ] 150 VUs  0m11.3s/2m0s
listing   [   9% ] 60 VUs   0m11.3s/2m0s

running (0m34.0s), 210/210 VUs, 2280 complete and 0 interrupted iterations
crud      [  10% ] 150 VUs  0m12.3s/2m0s
listing   [  10% ] 60 VUs   0m12.3s/2m0s

running (0m35.0s), 210/210 VUs, 2400 complete and 0 interrupted iterations
crud      [  11% ] 150 VUs  0m13.3s/2m0s
listing   [  11% ] 60 VUs   0m13.3s/2m0s

running (0m36.0s), 210/210 VUs, 2670 complete and 0 interrupted iterations
crud      [  12% ] 150 VUs  0m14.3s/2m0s
listing   [  12% ] 60 VUs   0m14.3s/2m0s

running (0m37.0s), 210/210 VUs, 2790 complete and 0 interrupted iterations
crud      [  13% ] 150 VUs  0m15.3s/2m0s
listing   [  13% ] 60 VUs   0m15.3s/2m0s

running (0m38.0s), 210/210 VUs, 3060 complete and 0 interrupted iterations
crud      [  14% ] 150 VUs  0m16.3s/2m0s
listing   [  14% ] 60 VUs   0m16.3s/2m0s

running (0m39.0s), 210/210 VUs, 3180 complete and 0 interrupted iterations
crud      [  14% ] 150 VUs  0m17.3s/2m0s
listing   [  14% ] 60 VUs   0m17.3s/2m0s

running (0m40.0s), 210/210 VUs, 3450 complete and 0 interrupted iterations
crud      [  15% ] 150 VUs  0m18.3s/2m0s
listing   [  15% ] 60 VUs   0m18.3s/2m0s

running (0m41.0s), 210/210 VUs, 3570 complete and 0 interrupted iterations
crud      [  16% ] 150 VUs  0m19.3s/2m0s
listing   [  16% ] 60 VUs   0m19.3s/2m0s

running (0m42.0s), 210/210 VUs, 3840 complete and 0 interrupted iterations
crud      [  17% ] 150 VUs  0m20.3s/2m0s
listing   [  17% ] 60 VUs   0m20.3s/2m0s

running (0m43.0s), 210/210 VUs, 3960 complete and 0 interrupted iterations
crud      [  18% ] 150 VUs  0m21.3s/2m0s
listing   [  18% ] 60 VUs   0m21.3s/2m0s

running (0m44.0s), 210/210 VUs, 4230 complete and 0 interrupted iterations
crud      [  19% ] 150 VUs  0m22.3s/2m0s
listing   [  19% ] 60 VUs   0m22.3s/2m0s

running (0m45.0s), 210/210 VUs, 4350 complete and 0 interrupted iterations
crud      [  19% ] 150 VUs  0m23.3s/2m0s
listing   [  19% ] 60 VUs   0m23.3s/2m0s

running (0m46.0s), 210/210 VUs, 4620 complete and 0 interrupted iterations
crud      [  20% ] 150 VUs  0m24.3s/2m0s
listing   [  20% ] 60 VUs   0m24.3s/2m0s

running (0m47.0s), 210/210 VUs, 4740 complete and 0 interrupted iterations
crud      [  21% ] 150 VUs  0m25.3s/2m0s
listing   [  21% ] 60 VUs   0m25.3s/2m0s

running (0m48.0s), 210/210 VUs, 5010 complete and 0 interrupted iterations
crud      [  22% ] 150 VUs  0m26.3s/2m0s
listing   [  22% ] 60 VUs   0m26.3s/2m0s

running (0m49.0s), 210/210 VUs, 5116 complete and 0 interrupted iterations
crud      [  23% ] 150 VUs  0m27.3s/2m0s
listing   [  23% ] 60 VUs   0m27.3s/2m0s

running (0m50.0s), 210/210 VUs, 5386 complete and 0 interrupted iterations
crud      [  24% ] 150 VUs  0m28.3s/2m0s
listing   [  24% ] 60 VUs   0m28.3s/2m0s

running (0m51.0s), 210/210 VUs, 5502 complete and 0 interrupted iterations
crud      [  24% ] 150 VUs  0m29.3s/2m0s
listing   [  24% ] 60 VUs   0m29.3s/2m0s

running (0m52.0s), 210/210 VUs, 5767 complete and 0 interrupted iterations
crud      [  25% ] 150 VUs  0m30.3s/2m0s
listing   [  25% ] 60 VUs   0m30.3s/2m0s

running (0m53.0s), 210/210 VUs, 5879 complete and 0 interrupted iterations
crud      [  26% ] 150 VUs  0m31.3s/2m0s
listing   [  26% ] 60 VUs   0m31.3s/2m0s

running (0m54.0s), 210/210 VUs, 6146 complete and 0 interrupted iterations
crud      [  27% ] 150 VUs  0m32.3s/2m0s
listing   [  27% ] 60 VUs   0m32.3s/2m0s

running (0m55.0s), 210/210 VUs, 6254 complete and 0 interrupted iterations
crud      [  28% ] 150 VUs  0m33.3s/2m0s
listing   [  28% ] 60 VUs   0m33.3s/2m0s

running (0m56.0s), 210/210 VUs, 6522 complete and 0 interrupted iterations
crud      [  29% ] 150 VUs  0m34.3s/2m0s
listing   [  29% ] 60 VUs   0m34.3s/2m0s

running (0m57.0s), 210/210 VUs, 6642 complete and 0 interrupted iterations
crud      [  29% ] 150 VUs  0m35.3s/2m0s
listing   [  29% ] 60 VUs   0m35.3s/2m0s

running (0m58.0s), 210/210 VUs, 6909 complete and 0 interrupted iterations
crud      [  30% ] 150 VUs  0m36.3s/2m0s
listing   [  30% ] 60 VUs   0m36.3s/2m0s

running (0m59.0s), 210/210 VUs, 7027 complete and 0 interrupted iterations
crud      [  31% ] 150 VUs  0m37.3s/2m0s
listing   [  31% ] 60 VUs   0m37.3s/2m0s

running (1m00.0s), 210/210 VUs, 7293 complete and 0 interrupted iterations
crud      [  32% ] 150 VUs  0m38.3s/2m0s
listing   [  32% ] 60 VUs   0m38.3s/2m0s

running (1m01.0s), 210/210 VUs, 7411 complete and 0 interrupted iterations
crud      [  33% ] 150 VUs  0m39.3s/2m0s
listing   [  33% ] 60 VUs   0m39.3s/2m0s

running (1m02.0s), 210/210 VUs, 7680 complete and 0 interrupted iterations
crud      [  34% ] 150 VUs  0m40.3s/2m0s
listing   [  34% ] 60 VUs   0m40.3s/2m0s

running (1m03.0s), 210/210 VUs, 7800 complete and 0 interrupted iterations
crud      [  34% ] 150 VUs  0m41.3s/2m0s
listing   [  34% ] 60 VUs   0m41.3s/2m0s

running (1m04.0s), 210/210 VUs, 8070 complete and 0 interrupted iterations
crud      [  35% ] 150 VUs  0m42.3s/2m0s
listing   [  35% ] 60 VUs   0m42.3s/2m0s

running (1m05.0s), 210/210 VUs, 8190 complete and 0 interrupted iterations
crud      [  36% ] 150 VUs  0m43.3s/2m0s
listing   [  36% ] 60 VUs   0m43.3s/2m0s

running (1m06.0s), 210/210 VUs, 8460 complete and 0 interrupted iterations
crud      [  37% ] 150 VUs  0m44.3s/2m0s
listing   [  37% ] 60 VUs   0m44.3s/2m0s

running (1m07.0s), 210/210 VUs, 8580 complete and 0 interrupted iterations
crud      [  38% ] 150 VUs  0m45.3s/2m0s
listing   [  38% ] 60 VUs   0m45.3s/2m0s

running (1m08.0s), 210/210 VUs, 8850 complete and 0 interrupted iterations
crud      [  39% ] 150 VUs  0m46.3s/2m0s
listing   [  39% ] 60 VUs   0m46.3s/2m0s

running (1m09.0s), 210/210 VUs, 8970 complete and 0 interrupted iterations
crud      [  39% ] 150 VUs  0m47.3s/2m0s
listing   [  39% ] 60 VUs   0m47.3s/2m0s

running (1m10.0s), 210/210 VUs, 9240 complete and 0 interrupted iterations
crud      [  40% ] 150 VUs  0m48.3s/2m0s
listing   [  40% ] 60 VUs   0m48.3s/2m0s

running (1m11.0s), 210/210 VUs, 9360 complete and 0 interrupted iterations
crud      [  41% ] 150 VUs  0m49.3s/2m0s
listing   [  41% ] 60 VUs   0m49.3s/2m0s

running (1m12.0s), 210/210 VUs, 9630 complete and 0 interrupted iterations
crud      [  42% ] 150 VUs  0m50.3s/2m0s
listing   [  42% ] 60 VUs   0m50.3s/2m0s

running (1m13.0s), 210/210 VUs, 9750 complete and 0 interrupted iterations
crud      [  43% ] 150 VUs  0m51.3s/2m0s
listing   [  43% ] 60 VUs   0m51.3s/2m0s

running (1m14.0s), 210/210 VUs, 10004 complete and 0 interrupted iterations
crud      [  44% ] 150 VUs  0m52.3s/2m0s
listing   [  44% ] 60 VUs   0m52.3s/2m0s

running (1m15.0s), 210/210 VUs, 10121 complete and 0 interrupted iterations
crud      [  44% ] 150 VUs  0m53.3s/2m0s
listing   [  44% ] 60 VUs   0m53.3s/2m0s

running (1m16.0s), 210/210 VUs, 10387 complete and 0 interrupted iterations
crud      [  45% ] 150 VUs  0m54.3s/2m0s
listing   [  45% ] 60 VUs   0m54.3s/2m0s

running (1m17.0s), 210/210 VUs, 10500 complete and 0 interrupted iterations
crud      [  46% ] 150 VUs  0m55.3s/2m0s
listing   [  46% ] 60 VUs   0m55.3s/2m0s

running (1m18.0s), 210/210 VUs, 10768 complete and 0 interrupted iterations
crud      [  47% ] 150 VUs  0m56.3s/2m0s
listing   [  47% ] 60 VUs   0m56.3s/2m0s

running (1m19.0s), 210/210 VUs, 10872 complete and 0 interrupted iterations
crud      [  48% ] 150 VUs  0m57.3s/2m0s
listing   [  48% ] 60 VUs   0m57.3s/2m0s

running (1m20.0s), 210/210 VUs, 11139 complete and 0 interrupted iterations
crud      [  49% ] 150 VUs  0m58.3s/2m0s
listing   [  49% ] 60 VUs   0m58.3s/2m0s

running (1m21.0s), 210/210 VUs, 11251 complete and 0 interrupted iterations
crud      [  49% ] 150 VUs  0m59.3s/2m0s
listing   [  49% ] 60 VUs   0m59.3s/2m0s

running (1m22.0s), 210/210 VUs, 11521 complete and 0 interrupted iterations
crud      [  50% ] 150 VUs  1m00.3s/2m0s
listing   [  50% ] 60 VUs   1m00.3s/2m0s

running (1m23.0s), 210/210 VUs, 11641 complete and 0 interrupted iterations
crud      [  51% ] 150 VUs  1m01.3s/2m0s
listing   [  51% ] 60 VUs   1m01.3s/2m0s

running (1m24.0s), 210/210 VUs, 11911 complete and 0 interrupted iterations
crud      [  52% ] 150 VUs  1m02.3s/2m0s
listing   [  52% ] 60 VUs   1m02.3s/2m0s

running (1m25.0s), 210/210 VUs, 12030 complete and 0 interrupted iterations
crud      [  53% ] 150 VUs  1m03.3s/2m0s
listing   [  53% ] 60 VUs   1m03.3s/2m0s

running (1m26.0s), 210/210 VUs, 12300 complete and 0 interrupted iterations
crud      [  54% ] 150 VUs  1m04.3s/2m0s
listing   [  54% ] 60 VUs   1m04.3s/2m0s

running (1m27.0s), 210/210 VUs, 12420 complete and 0 interrupted iterations
crud      [  54% ] 150 VUs  1m05.3s/2m0s
listing   [  54% ] 60 VUs   1m05.3s/2m0s

running (1m28.0s), 210/210 VUs, 12690 complete and 0 interrupted iterations
crud      [  55% ] 150 VUs  1m06.3s/2m0s
listing   [  55% ] 60 VUs   1m06.3s/2m0s

running (1m29.0s), 210/210 VUs, 12810 complete and 0 interrupted iterations
crud      [  56% ] 150 VUs  1m07.3s/2m0s
listing   [  56% ] 60 VUs   1m07.3s/2m0s

running (1m30.0s), 210/210 VUs, 13080 complete and 0 interrupted iterations
crud      [  57% ] 150 VUs  1m08.3s/2m0s
listing   [  57% ] 60 VUs   1m08.3s/2m0s
time="2026-05-28T18:08:51-03:00" level=warning msg="The test has generated metrics with 100252 unique time series, which is higher than the suggested limit of 100000 and could cause high memory usage. Consider not using high-cardinality values like unique IDs as metric tags or, if you need them in the URL, use the name metric tag or URL grouping. See https://grafana.com/docs/k6/latest/using-k6/tags-and-groups/ for details." component=metrics-engine-ingester

running (1m31.0s), 210/210 VUs, 13200 complete and 0 interrupted iterations
crud      [  58% ] 150 VUs  1m09.3s/2m0s
listing   [  58% ] 60 VUs   1m09.3s/2m0s

running (1m32.0s), 210/210 VUs, 13470 complete and 0 interrupted iterations
crud      [  59% ] 150 VUs  1m10.3s/2m0s
listing   [  59% ] 60 VUs   1m10.3s/2m0s

running (1m33.0s), 210/210 VUs, 13591 complete and 0 interrupted iterations
crud      [  59% ] 150 VUs  1m11.3s/2m0s
listing   [  59% ] 60 VUs   1m11.3s/2m0s

running (1m34.0s), 210/210 VUs, 13860 complete and 0 interrupted iterations
crud      [  60% ] 150 VUs  1m12.3s/2m0s
listing   [  60% ] 60 VUs   1m12.3s/2m0s

running (1m35.0s), 210/210 VUs, 13992 complete and 0 interrupted iterations
crud      [  61% ] 150 VUs  1m13.3s/2m0s
listing   [  61% ] 60 VUs   1m13.3s/2m0s

running (1m36.0s), 210/210 VUs, 14235 complete and 0 interrupted iterations
crud      [  62% ] 150 VUs  1m14.3s/2m0s
listing   [  62% ] 60 VUs   1m14.3s/2m0s

running (1m37.0s), 210/210 VUs, 14360 complete and 0 interrupted iterations
crud      [  63% ] 150 VUs  1m15.3s/2m0s
listing   [  63% ] 60 VUs   1m15.3s/2m0s

running (1m38.0s), 210/210 VUs, 14599 complete and 0 interrupted iterations
crud      [  64% ] 150 VUs  1m16.3s/2m0s
listing   [  64% ] 60 VUs   1m16.3s/2m0s

running (1m39.0s), 210/210 VUs, 14734 complete and 0 interrupted iterations
crud      [  64% ] 150 VUs  1m17.3s/2m0s
listing   [  64% ] 60 VUs   1m17.3s/2m0s

running (1m40.0s), 210/210 VUs, 14980 complete and 0 interrupted iterations
crud      [  65% ] 150 VUs  1m18.3s/2m0s
listing   [  65% ] 60 VUs   1m18.3s/2m0s

running (1m41.0s), 210/210 VUs, 15127 complete and 0 interrupted iterations
crud      [  66% ] 150 VUs  1m19.3s/2m0s
listing   [  66% ] 60 VUs   1m19.3s/2m0s

running (1m42.0s), 210/210 VUs, 15361 complete and 0 interrupted iterations
crud      [  67% ] 150 VUs  1m20.3s/2m0s
listing   [  67% ] 60 VUs   1m20.3s/2m0s

running (1m43.0s), 210/210 VUs, 15535 complete and 0 interrupted iterations
crud      [  68% ] 150 VUs  1m21.3s/2m0s
listing   [  68% ] 60 VUs   1m21.3s/2m0s

running (1m44.0s), 210/210 VUs, 15751 complete and 0 interrupted iterations
crud      [  69% ] 150 VUs  1m22.3s/2m0s
listing   [  69% ] 60 VUs   1m22.3s/2m0s

running (1m45.0s), 210/210 VUs, 15918 complete and 0 interrupted iterations
crud      [  69% ] 150 VUs  1m23.3s/2m0s
listing   [  69% ] 60 VUs   1m23.3s/2m0s

running (1m46.0s), 210/210 VUs, 16141 complete and 0 interrupted iterations
crud      [  70% ] 150 VUs  1m24.3s/2m0s
listing   [  70% ] 60 VUs   1m24.3s/2m0s

running (1m47.0s), 210/210 VUs, 16309 complete and 0 interrupted iterations
crud      [  71% ] 150 VUs  1m25.3s/2m0s
listing   [  71% ] 60 VUs   1m25.3s/2m0s

running (1m48.0s), 210/210 VUs, 16531 complete and 0 interrupted iterations
crud      [  72% ] 150 VUs  1m26.3s/2m0s
listing   [  72% ] 60 VUs   1m26.3s/2m0s

running (1m49.0s), 210/210 VUs, 16715 complete and 0 interrupted iterations
crud      [  73% ] 150 VUs  1m27.3s/2m0s
listing   [  73% ] 60 VUs   1m27.3s/2m0s

running (1m50.0s), 210/210 VUs, 16920 complete and 0 interrupted iterations
crud      [  74% ] 150 VUs  1m28.3s/2m0s
listing   [  74% ] 60 VUs   1m28.3s/2m0s

running (1m51.0s), 210/210 VUs, 17105 complete and 0 interrupted iterations
crud      [  74% ] 150 VUs  1m29.3s/2m0s
listing   [  74% ] 60 VUs   1m29.3s/2m0s

running (1m52.0s), 210/210 VUs, 17310 complete and 0 interrupted iterations
crud      [  75% ] 150 VUs  1m30.3s/2m0s
listing   [  75% ] 60 VUs   1m30.3s/2m0s

running (1m53.0s), 210/210 VUs, 17495 complete and 0 interrupted iterations
crud      [  76% ] 150 VUs  1m31.3s/2m0s
listing   [  76% ] 60 VUs   1m31.3s/2m0s

running (1m54.0s), 210/210 VUs, 17700 complete and 0 interrupted iterations
crud      [  77% ] 150 VUs  1m32.3s/2m0s
listing   [  77% ] 60 VUs   1m32.3s/2m0s

running (1m55.0s), 210/210 VUs, 17889 complete and 0 interrupted iterations
crud      [  78% ] 150 VUs  1m33.3s/2m0s
listing   [  78% ] 60 VUs   1m33.3s/2m0s

running (1m56.0s), 210/210 VUs, 18090 complete and 0 interrupted iterations
crud      [  79% ] 150 VUs  1m34.3s/2m0s
listing   [  79% ] 60 VUs   1m34.3s/2m0s

running (1m57.0s), 210/210 VUs, 18293 complete and 0 interrupted iterations
crud      [  79% ] 150 VUs  1m35.3s/2m0s
listing   [  79% ] 60 VUs   1m35.3s/2m0s

running (1m58.0s), 210/210 VUs, 18460 complete and 0 interrupted iterations
crud      [  80% ] 150 VUs  1m36.3s/2m0s
listing   [  80% ] 60 VUs   1m36.3s/2m0s

running (1m59.0s), 210/210 VUs, 18652 complete and 0 interrupted iterations
crud      [  81% ] 150 VUs  1m37.3s/2m0s
listing   [  81% ] 60 VUs   1m37.3s/2m0s

running (2m00.0s), 210/210 VUs, 18830 complete and 0 interrupted iterations
crud      [  82% ] 150 VUs  1m38.3s/2m0s
listing   [  82% ] 60 VUs   1m38.3s/2m0s

running (2m01.0s), 210/210 VUs, 19037 complete and 0 interrupted iterations
crud      [  83% ] 150 VUs  1m39.3s/2m0s
listing   [  83% ] 60 VUs   1m39.3s/2m0s

running (2m02.0s), 210/210 VUs, 19201 complete and 0 interrupted iterations
crud      [  84% ] 150 VUs  1m40.3s/2m0s
listing   [  84% ] 60 VUs   1m40.3s/2m0s

running (2m03.0s), 210/210 VUs, 19443 complete and 0 interrupted iterations
crud      [  84% ] 150 VUs  1m41.3s/2m0s
listing   [  84% ] 60 VUs   1m41.3s/2m0s

running (2m04.0s), 210/210 VUs, 19591 complete and 0 interrupted iterations
crud      [  85% ] 150 VUs  1m42.3s/2m0s
listing   [  85% ] 60 VUs   1m42.3s/2m0s

running (2m05.0s), 210/210 VUs, 19807 complete and 0 interrupted iterations
crud      [  86% ] 150 VUs  1m43.3s/2m0s
listing   [  86% ] 60 VUs   1m43.3s/2m0s

running (2m06.0s), 210/210 VUs, 19981 complete and 0 interrupted iterations
crud      [  87% ] 150 VUs  1m44.3s/2m0s
listing   [  87% ] 60 VUs   1m44.3s/2m0s

running (2m07.0s), 210/210 VUs, 20195 complete and 0 interrupted iterations
crud      [  88% ] 150 VUs  1m45.3s/2m0s
listing   [  88% ] 60 VUs   1m45.3s/2m0s

running (2m08.0s), 210/210 VUs, 20370 complete and 0 interrupted iterations
crud      [  89% ] 150 VUs  1m46.3s/2m0s
listing   [  89% ] 60 VUs   1m46.3s/2m0s

running (2m09.0s), 210/210 VUs, 20591 complete and 0 interrupted iterations
crud      [  89% ] 150 VUs  1m47.3s/2m0s
listing   [  89% ] 60 VUs   1m47.3s/2m0s

running (2m10.0s), 210/210 VUs, 20760 complete and 0 interrupted iterations
crud      [  90% ] 150 VUs  1m48.3s/2m0s
listing   [  90% ] 60 VUs   1m48.3s/2m0s

running (2m11.0s), 210/210 VUs, 20999 complete and 0 interrupted iterations
crud      [  91% ] 150 VUs  1m49.3s/2m0s
listing   [  91% ] 60 VUs   1m49.3s/2m0s

running (2m12.0s), 210/210 VUs, 21139 complete and 0 interrupted iterations
crud      [  92% ] 150 VUs  1m50.3s/2m0s
listing   [  92% ] 60 VUs   1m50.3s/2m0s

running (2m13.0s), 210/210 VUs, 21385 complete and 0 interrupted iterations
crud      [  93% ] 150 VUs  1m51.3s/2m0s
listing   [  93% ] 60 VUs   1m51.3s/2m0s

running (2m14.0s), 210/210 VUs, 21519 complete and 0 interrupted iterations
crud      [  94% ] 150 VUs  1m52.3s/2m0s
listing   [  94% ] 60 VUs   1m52.3s/2m0s

running (2m15.0s), 210/210 VUs, 21756 complete and 0 interrupted iterations
crud      [  94% ] 150 VUs  1m53.3s/2m0s
listing   [  94% ] 60 VUs   1m53.3s/2m0s

running (2m16.0s), 210/210 VUs, 21871 complete and 0 interrupted iterations
crud      [  95% ] 150 VUs  1m54.3s/2m0s
listing   [  95% ] 60 VUs   1m54.3s/2m0s

running (2m17.0s), 210/210 VUs, 22141 complete and 0 interrupted iterations
crud      [  96% ] 150 VUs  1m55.3s/2m0s
listing   [  96% ] 60 VUs   1m55.3s/2m0s

running (2m18.0s), 210/210 VUs, 22261 complete and 0 interrupted iterations
crud      [  97% ] 150 VUs  1m56.3s/2m0s
listing   [  97% ] 60 VUs   1m56.3s/2m0s

running (2m19.0s), 210/210 VUs, 22531 complete and 0 interrupted iterations
crud      [  98% ] 150 VUs  1m57.3s/2m0s
listing   [  98% ] 60 VUs   1m57.3s/2m0s

running (2m20.0s), 210/210 VUs, 22651 complete and 0 interrupted iterations
crud      [  99% ] 150 VUs  1m58.3s/2m0s
listing   [  99% ] 60 VUs   1m58.3s/2m0s

running (2m21.0s), 210/210 VUs, 22911 complete and 0 interrupted iterations
crud      [  99% ] 150 VUs  1m59.3s/2m0s
listing   [  99% ] 60 VUs   1m59.3s/2m0s

running (2m22.0s), 150/210 VUs, 23041 complete and 0 interrupted iterations
crud    ↓ [ 100% ] 150 VUs  2m0s
listing ✓ [ 100% ] 60 VUs   2m0s

running (2m23.0s), 035/210 VUs, 23156 complete and 0 interrupted iterations
crud    ↓ [ 100% ] 150 VUs  2m0s
listing ✓ [ 100% ] 60 VUs   2m0s


  █ THRESHOLDS 

    http_req_duration
    ✓ 'p(95)<1500' p(95)=36.42ms

      {scenario:crud}
      ✓ 'p(95)<1800' p(95)=38.96ms

      {scenario:listing}
      ✓ 'p(95)<1000' p(95)=28.2ms

    http_req_failed
    ✓ 'rate<0.02' rate=0.00%


  █ TOTAL RESULTS 

    checks_total.......: 73832   516.212085/s
    checks_succeeded...: 100.00% 73832 out of 73832
    checks_failed......: 0.00%   0 out of 73832

    ✓ like on 200
    ✓ list 200
    ✓ has page
    ✓ reply 201
    ✓ reply retorna id
    ✓ delete reply 204
    ✓ like off 200

    HTTP
    http_req_duration..............: avg=18.83ms min=2.62ms   med=16.57ms  max=210.15ms p(90)=29.83ms p(95)=36.42ms
      { expected_response:true }...: avg=18.83ms min=2.62ms   med=16.57ms  max=210.15ms p(90)=29.83ms p(95)=36.42ms
      { scenario:crud }............: avg=21.31ms min=4.59ms   med=18.83ms  max=210.15ms p(90)=31.59ms p(95)=38.96ms
      { scenario:listing }.........: avg=12.7ms  min=2.62ms   med=9.76ms   max=198.62ms p(90)=21.61ms p(95)=28.2ms 
    http_req_failed................: 0.00% 0 out of 52021
    http_reqs......................: 52021 363.715853/s

    EXECUTION
    iteration_duration.............: avg=1.09s   min=502.75ms med=517.24ms max=2.28s    p(90)=1.99s   p(95)=2s     
    iterations.....................: 23191 162.144794/s
    vus............................: 35    min=0          max=210
    vus_max........................: 210   min=210        max=210

    NETWORK
    data_received..................: 23 MB 163 kB/s
    data_sent......................: 21 MB 144 kB/s




running (2m23.0s), 000/210 VUs, 23191 complete and 0 interrupted iterations
crud    ✓ [ 100% ] 150 VUs  2m0s
listing ✓ [ 100% ] 60 VUs   2m0s

================================================================
% cd DomainFeed/commentInteraction && k6 run commentInteraction-spike.js
================================================================


         /\      Grafana   /‾‾/  
    /\  /  \     |\  __   /  /   
   /  \/    \    | |/ /  /   ‾‾\ 
  /          \   |   (  |  (‾)  |
 / __________ \  |_|\_\  \_____/ 


     execution: local
        script: commentInteraction-spike.js
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

running (0m45.0s), 003/500 VUs, 0 complete and 0 interrupted iterations
default   [   1% ] 003/500 VUs  00.4s/50.0s

running (0m46.0s), 010/500 VUs, 5 complete and 0 interrupted iterations
default   [   3% ] 010/500 VUs  01.4s/50.0s

running (0m47.0s), 017/500 VUs, 20 complete and 0 interrupted iterations
default   [   5% ] 017/500 VUs  02.4s/50.0s

running (0m48.0s), 024/500 VUs, 45 complete and 0 interrupted iterations
default   [   7% ] 024/500 VUs  03.4s/50.0s

running (0m49.0s), 031/500 VUs, 77 complete and 0 interrupted iterations
default   [   9% ] 031/500 VUs  04.4s/50.0s

running (0m50.0s), 038/500 VUs, 122 complete and 0 interrupted iterations
default   [  11% ] 038/500 VUs  05.4s/50.0s

running (0m51.0s), 045/500 VUs, 172 complete and 0 interrupted iterations
default   [  13% ] 045/500 VUs  06.4s/50.0s

running (0m52.0s), 052/500 VUs, 233 complete and 0 interrupted iterations
default   [  15% ] 052/500 VUs  07.4s/50.0s

running (0m53.0s), 058/500 VUs, 305 complete and 0 interrupted iterations
default   [  17% ] 058/500 VUs  08.4s/50.0s

running (0m54.0s), 065/500 VUs, 388 complete and 0 interrupted iterations
default   [  19% ] 065/500 VUs  09.4s/50.0s

running (0m55.0s), 104/500 VUs, 474 complete and 0 interrupted iterations
default   [  21% ] 104/500 VUs  10.4s/50.0s

running (0m56.0s), 190/500 VUs, 622 complete and 0 interrupted iterations
default   [  23% ] 190/500 VUs  11.4s/50.0s

running (0m57.0s), 276/500 VUs, 851 complete and 0 interrupted iterations
default   [  25% ] 276/500 VUs  12.4s/50.0s

running (0m58.0s), 362/500 VUs, 1083 complete and 0 interrupted iterations
default   [  27% ] 362/500 VUs  13.4s/50.0s

running (0m59.0s), 448/500 VUs, 1331 complete and 0 interrupted iterations
default   [  29% ] 448/500 VUs  14.4s/50.0s

running (1m00.0s), 500/500 VUs, 1564 complete and 0 interrupted iterations
default   [  31% ] 500/500 VUs  15.4s/50.0s

running (1m01.0s), 500/500 VUs, 1803 complete and 0 interrupted iterations
default   [  33% ] 500/500 VUs  16.4s/50.0s

running (1m02.0s), 500/500 VUs, 2100 complete and 0 interrupted iterations
default   [  35% ] 500/500 VUs  17.4s/50.0s

running (1m03.0s), 500/500 VUs, 2364 complete and 0 interrupted iterations
default   [  37% ] 500/500 VUs  18.4s/50.0s

running (1m04.0s), 500/500 VUs, 2646 complete and 0 interrupted iterations
default   [  39% ] 500/500 VUs  19.4s/50.0s

running (1m05.0s), 500/500 VUs, 2905 complete and 0 interrupted iterations
default   [  41% ] 500/500 VUs  20.4s/50.0s

running (1m06.0s), 500/500 VUs, 3204 complete and 0 interrupted iterations
default   [  43% ] 500/500 VUs  21.4s/50.0s

running (1m07.0s), 500/500 VUs, 3460 complete and 0 interrupted iterations
default   [  45% ] 500/500 VUs  22.4s/50.0s

running (1m08.0s), 500/500 VUs, 3755 complete and 0 interrupted iterations
default   [  47% ] 500/500 VUs  23.4s/50.0s

running (1m09.0s), 500/500 VUs, 4018 complete and 0 interrupted iterations
default   [  49% ] 500/500 VUs  24.4s/50.0s

running (1m10.0s), 500/500 VUs, 4298 complete and 0 interrupted iterations
default   [  51% ] 500/500 VUs  25.4s/50.0s

running (1m11.0s), 500/500 VUs, 4562 complete and 0 interrupted iterations
default   [  53% ] 500/500 VUs  26.4s/50.0s
time="2026-05-28T18:10:55-03:00" level=warning msg="The test has generated metrics with 100027 unique time series, which is higher than the suggested limit of 100000 and could cause high memory usage. Consider not using high-cardinality values like unique IDs as metric tags or, if you need them in the URL, use the name metric tag or URL grouping. See https://grafana.com/docs/k6/latest/using-k6/tags-and-groups/ for details." component=metrics-engine-ingester

running (1m12.0s), 500/500 VUs, 4848 complete and 0 interrupted iterations
default   [  55% ] 500/500 VUs  27.4s/50.0s

running (1m13.0s), 500/500 VUs, 5129 complete and 0 interrupted iterations
default   [  57% ] 500/500 VUs  28.4s/50.0s

running (1m14.0s), 500/500 VUs, 5406 complete and 0 interrupted iterations
default   [  59% ] 500/500 VUs  29.4s/50.0s

running (1m15.0s), 500/500 VUs, 5673 complete and 0 interrupted iterations
default   [  61% ] 500/500 VUs  30.4s/50.0s

running (1m16.0s), 500/500 VUs, 5929 complete and 0 interrupted iterations
default   [  63% ] 500/500 VUs  31.4s/50.0s

running (1m17.0s), 500/500 VUs, 6193 complete and 0 interrupted iterations
default   [  65% ] 500/500 VUs  32.4s/50.0s

running (1m18.0s), 500/500 VUs, 6477 complete and 0 interrupted iterations
default   [  67% ] 500/500 VUs  33.4s/50.0s

running (1m19.0s), 500/500 VUs, 6743 complete and 0 interrupted iterations
default   [  69% ] 500/500 VUs  34.4s/50.0s

running (1m20.0s), 497/500 VUs, 7009 complete and 0 interrupted iterations
default   [  71% ] 497/500 VUs  35.4s/50.0s

running (1m21.0s), 459/500 VUs, 7297 complete and 0 interrupted iterations
default   [  73% ] 459/500 VUs  36.4s/50.0s

running (1m22.0s), 370/500 VUs, 7591 complete and 0 interrupted iterations
default   [  75% ] 370/500 VUs  37.4s/50.0s

running (1m23.0s), 247/500 VUs, 7929 complete and 0 interrupted iterations
default   [  77% ] 247/500 VUs  38.4s/50.0s

running (1m24.0s), 159/500 VUs, 8229 complete and 0 interrupted iterations
default   [  79% ] 159/500 VUs  39.4s/50.0s

running (1m25.0s), 079/500 VUs, 8420 complete and 0 interrupted iterations
default   [  81% ] 079/500 VUs  40.4s/50.0s

running (1m26.0s), 063/500 VUs, 8522 complete and 0 interrupted iterations
default   [  83% ] 063/500 VUs  41.4s/50.0s

running (1m27.0s), 056/500 VUs, 8612 complete and 0 interrupted iterations
default   [  85% ] 056/500 VUs  42.4s/50.0s

running (1m28.0s), 048/500 VUs, 8685 complete and 0 interrupted iterations
default   [  87% ] 048/500 VUs  43.4s/50.0s

running (1m29.0s), 042/500 VUs, 8746 complete and 0 interrupted iterations
default   [  89% ] 042/500 VUs  44.4s/50.0s

running (1m30.0s), 034/500 VUs, 8804 complete and 0 interrupted iterations
default   [  91% ] 034/500 VUs  45.4s/50.0s

running (1m31.0s), 028/500 VUs, 8850 complete and 0 interrupted iterations
default   [  93% ] 028/500 VUs  46.4s/50.0s

running (1m32.0s), 022/500 VUs, 8882 complete and 0 interrupted iterations
default   [  95% ] 022/500 VUs  47.4s/50.0s

running (1m33.0s), 015/500 VUs, 8910 complete and 0 interrupted iterations
default   [  97% ] 015/500 VUs  48.4s/50.0s

running (1m34.0s), 007/500 VUs, 8927 complete and 0 interrupted iterations
default   [  99% ] 007/500 VUs  49.4s/50.0s

running (1m35.0s), 001/500 VUs, 8937 complete and 0 interrupted iterations
default ↓ [ 100% ] 004/500 VUs  50s


  █ THRESHOLDS 

    http_req_duration
    ✓ 'p(95)<2500' p(95)=540.53ms

    http_req_failed
    ✓ 'rate<0.05' rate=0.00%


  █ TOTAL RESULTS 

    checks_total.......: 17876   187.921148/s
    checks_succeeded...: 100.00% 17876 out of 17876
    checks_failed......: 0.00%   0 out of 17876

    ✓ like 200 ou 429
    ✓ reply 201 ou 429

    HTTP
    http_req_duration..............: avg=255.76ms min=3.37ms  med=306.32ms max=1.11s p(90)=485.66ms p(95)=540.53ms
      { expected_response:true }...: avg=255.76ms min=3.37ms  med=306.32ms max=1.11s p(90)=485.66ms p(95)=540.53ms
    http_req_failed................: 0.00% 0 out of 29814
    http_reqs......................: 29814 313.419172/s

    EXECUTION
    iteration_duration.............: avg=1.54s    min=720.8ms med=1.69s    max=2.67s p(90)=2s       p(95)=2.11s   
    iterations.....................: 8938  93.960574/s
    vus............................: 1     min=0          max=500
    vus_max........................: 500   min=500        max=500

    NETWORK
    data_received..................: 14 MB 148 kB/s
    data_sent......................: 12 MB 127 kB/s




running (1m35.1s), 000/500 VUs, 8938 complete and 0 interrupted iterations
default ✓ [ 100% ] 000/500 VUs  50s

================================================================
% cd DomainFeed/commentInteraction && k6 run commentInteraction-stress.js
================================================================


         /\      Grafana   /‾‾/  
    /\  /  \     |\  __   /  /   
   /  \/    \    | |/ /  /   ‾‾\ 
  /          \   |   (  |  (‾)  |
 / __________ \  |_|\_\  \_____/ 


     execution: local
        script: commentInteraction-stress.js
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

running (1m13.0s), 001/600 VUs, 0 complete and 0 interrupted iterations
default   [   0% ] 001/600 VUs  0m00.1s/4m00.0s

running (1m14.0s), 001/600 VUs, 0 complete and 0 interrupted iterations
default   [   0% ] 001/600 VUs  0m01.1s/4m00.0s

running (1m15.0s), 002/600 VUs, 1 complete and 0 interrupted iterations
default   [   1% ] 002/600 VUs  0m02.1s/4m00.0s

running (1m16.0s), 002/600 VUs, 3 complete and 0 interrupted iterations
default   [   1% ] 002/600 VUs  0m03.1s/4m00.0s

running (1m17.0s), 003/600 VUs, 5 complete and 0 interrupted iterations
default   [   2% ] 003/600 VUs  0m04.1s/4m00.0s

running (1m18.0s), 004/600 VUs, 8 complete and 0 interrupted iterations
default   [   2% ] 004/600 VUs  0m05.1s/4m00.0s

running (1m19.0s), 004/600 VUs, 11 complete and 0 interrupted iterations
default   [   3% ] 004/600 VUs  0m06.1s/4m00.0s

running (1m20.0s), 005/600 VUs, 14 complete and 0 interrupted iterations
default   [   3% ] 005/600 VUs  0m07.1s/4m00.0s

running (1m21.0s), 006/600 VUs, 18 complete and 0 interrupted iterations
default   [   3% ] 006/600 VUs  0m08.1s/4m00.0s

running (1m22.0s), 006/600 VUs, 22 complete and 0 interrupted iterations
default   [   4% ] 006/600 VUs  0m09.1s/4m00.0s

running (1m23.0s), 007/600 VUs, 28 complete and 0 interrupted iterations
default   [   4% ] 007/600 VUs  0m10.1s/4m00.0s

running (1m24.0s), 008/600 VUs, 34 complete and 0 interrupted iterations
default   [   5% ] 008/600 VUs  0m11.1s/4m00.0s

running (1m25.0s), 008/600 VUs, 40 complete and 0 interrupted iterations
default   [   5% ] 008/600 VUs  0m12.1s/4m00.0s

running (1m26.0s), 009/600 VUs, 46 complete and 0 interrupted iterations
default   [   5% ] 009/600 VUs  0m13.1s/4m00.0s

running (1m27.0s), 009/600 VUs, 54 complete and 0 interrupted iterations
default   [   6% ] 009/600 VUs  0m14.1s/4m00.0s

running (1m28.0s), 010/600 VUs, 60 complete and 0 interrupted iterations
default   [   6% ] 010/600 VUs  0m15.1s/4m00.0s

running (1m29.0s), 011/600 VUs, 70 complete and 0 interrupted iterations
default   [   7% ] 011/600 VUs  0m16.1s/4m00.0s

running (1m30.0s), 011/600 VUs, 80 complete and 0 interrupted iterations
default   [   7% ] 011/600 VUs  0m17.1s/4m00.0s

running (1m31.0s), 012/600 VUs, 88 complete and 0 interrupted iterations
default   [   8% ] 012/600 VUs  0m18.1s/4m00.0s

running (1m32.0s), 013/600 VUs, 98 complete and 0 interrupted iterations
default   [   8% ] 013/600 VUs  0m19.1s/4m00.0s

running (1m33.0s), 013/600 VUs, 108 complete and 0 interrupted iterations
default   [   8% ] 013/600 VUs  0m20.1s/4m00.0s

running (1m34.0s), 014/600 VUs, 117 complete and 0 interrupted iterations
default   [   9% ] 014/600 VUs  0m21.1s/4m00.0s

running (1m35.0s), 014/600 VUs, 130 complete and 0 interrupted iterations
default   [   9% ] 014/600 VUs  0m22.1s/4m00.0s

running (1m36.0s), 015/600 VUs, 144 complete and 0 interrupted iterations
default   [  10% ] 015/600 VUs  0m23.1s/4m00.0s

running (1m37.0s), 016/600 VUs, 155 complete and 0 interrupted iterations
default   [  10% ] 016/600 VUs  0m24.1s/4m00.0s

running (1m38.0s), 016/600 VUs, 169 complete and 0 interrupted iterations
default   [  10% ] 016/600 VUs  0m25.1s/4m00.0s

running (1m39.0s), 017/600 VUs, 181 complete and 0 interrupted iterations
default   [  11% ] 017/600 VUs  0m26.1s/4m00.0s

running (1m40.0s), 018/600 VUs, 194 complete and 0 interrupted iterations
default   [  11% ] 018/600 VUs  0m27.1s/4m00.0s

running (1m41.0s), 018/600 VUs, 210 complete and 0 interrupted iterations
default   [  12% ] 018/600 VUs  0m28.1s/4m00.0s

running (1m42.0s), 019/600 VUs, 227 complete and 0 interrupted iterations
default   [  12% ] 019/600 VUs  0m29.1s/4m00.0s

running (1m43.0s), 020/600 VUs, 242 complete and 0 interrupted iterations
default   [  13% ] 020/600 VUs  0m30.1s/4m00.0s

running (1m44.0s), 021/600 VUs, 258 complete and 0 interrupted iterations
default   [  13% ] 021/600 VUs  0m31.1s/4m00.0s

running (1m45.0s), 022/600 VUs, 274 complete and 0 interrupted iterations
default   [  13% ] 022/600 VUs  0m32.1s/4m00.0s

running (1m46.0s), 023/600 VUs, 290 complete and 0 interrupted iterations
default   [  14% ] 023/600 VUs  0m33.1s/4m00.0s

running (1m47.0s), 024/600 VUs, 309 complete and 0 interrupted iterations
default   [  14% ] 024/600 VUs  0m34.1s/4m00.0s

running (1m48.0s), 025/600 VUs, 328 complete and 0 interrupted iterations
default   [  15% ] 025/600 VUs  0m35.1s/4m00.0s

running (1m49.0s), 026/600 VUs, 348 complete and 0 interrupted iterations
default   [  15% ] 026/600 VUs  0m36.1s/4m00.0s

running (1m50.0s), 027/600 VUs, 373 complete and 0 interrupted iterations
default   [  15% ] 027/600 VUs  0m37.1s/4m00.0s

running (1m51.0s), 028/600 VUs, 394 complete and 0 interrupted iterations
default   [  16% ] 028/600 VUs  0m38.1s/4m00.0s

running (1m52.0s), 029/600 VUs, 415 complete and 0 interrupted iterations
default   [  16% ] 029/600 VUs  0m39.1s/4m00.0s

running (1m53.0s), 030/600 VUs, 439 complete and 0 interrupted iterations
default   [  17% ] 030/600 VUs  0m40.1s/4m00.0s

running (1m54.0s), 031/600 VUs, 463 complete and 0 interrupted iterations
default   [  17% ] 031/600 VUs  0m41.1s/4m00.0s

running (1m55.0s), 032/600 VUs, 488 complete and 0 interrupted iterations
default   [  18% ] 032/600 VUs  0m42.1s/4m00.0s

running (1m56.0s), 033/600 VUs, 512 complete and 0 interrupted iterations
default   [  18% ] 033/600 VUs  0m43.1s/4m00.0s

running (1m57.0s), 034/600 VUs, 537 complete and 0 interrupted iterations
default   [  18% ] 034/600 VUs  0m44.1s/4m00.0s

running (1m58.0s), 035/600 VUs, 570 complete and 0 interrupted iterations
default   [  19% ] 035/600 VUs  0m45.1s/4m00.0s

running (1m59.0s), 036/600 VUs, 599 complete and 0 interrupted iterations
default   [  19% ] 036/600 VUs  0m46.1s/4m00.0s

running (2m00.0s), 037/600 VUs, 628 complete and 0 interrupted iterations
default   [  20% ] 037/600 VUs  0m47.1s/4m00.0s

running (2m01.0s), 038/600 VUs, 658 complete and 0 interrupted iterations
default   [  20% ] 038/600 VUs  0m48.1s/4m00.0s

running (2m02.0s), 039/600 VUs, 687 complete and 0 interrupted iterations
default   [  20% ] 039/600 VUs  0m49.1s/4m00.0s

running (2m03.0s), 040/600 VUs, 717 complete and 0 interrupted iterations
default   [  21% ] 040/600 VUs  0m50.1s/4m00.0s

running (2m04.0s), 041/600 VUs, 749 complete and 0 interrupted iterations
default   [  21% ] 041/600 VUs  0m51.1s/4m00.0s

running (2m05.0s), 042/600 VUs, 789 complete and 0 interrupted iterations
default   [  22% ] 042/600 VUs  0m52.1s/4m00.0s

running (2m06.0s), 043/600 VUs, 823 complete and 0 interrupted iterations
default   [  22% ] 043/600 VUs  0m53.1s/4m00.0s

running (2m07.0s), 044/600 VUs, 858 complete and 0 interrupted iterations
default   [  23% ] 044/600 VUs  0m54.1s/4m00.0s

running (2m08.0s), 045/600 VUs, 892 complete and 0 interrupted iterations
default   [  23% ] 045/600 VUs  0m55.1s/4m00.0s

running (2m09.0s), 046/600 VUs, 927 complete and 0 interrupted iterations
default   [  23% ] 046/600 VUs  0m56.1s/4m00.0s

running (2m10.0s), 047/600 VUs, 964 complete and 0 interrupted iterations
default   [  24% ] 047/600 VUs  0m57.1s/4m00.0s

running (2m11.0s), 048/600 VUs, 1001 complete and 0 interrupted iterations
default   [  24% ] 048/600 VUs  0m58.1s/4m00.0s

running (2m12.0s), 049/600 VUs, 1040 complete and 0 interrupted iterations
default   [  25% ] 049/600 VUs  0m59.1s/4m00.0s

running (2m13.0s), 050/600 VUs, 1088 complete and 0 interrupted iterations
default   [  25% ] 050/600 VUs  1m00.1s/4m00.0s

running (2m14.0s), 051/600 VUs, 1127 complete and 0 interrupted iterations
default   [  25% ] 051/600 VUs  1m01.1s/4m00.0s

running (2m15.0s), 053/600 VUs, 1168 complete and 0 interrupted iterations
default   [  26% ] 053/600 VUs  1m02.1s/4m00.0s

running (2m16.0s), 055/600 VUs, 1212 complete and 0 interrupted iterations
default   [  26% ] 055/600 VUs  1m03.1s/4m00.0s

running (2m17.0s), 056/600 VUs, 1254 complete and 0 interrupted iterations
default   [  27% ] 056/600 VUs  1m04.1s/4m00.0s

running (2m18.0s), 058/600 VUs, 1300 complete and 0 interrupted iterations
default   [  27% ] 058/600 VUs  1m05.1s/4m00.0s

running (2m19.0s), 060/600 VUs, 1345 complete and 0 interrupted iterations
default   [  28% ] 060/600 VUs  1m06.1s/4m00.0s

running (2m20.0s), 061/600 VUs, 1392 complete and 0 interrupted iterations
default   [  28% ] 061/600 VUs  1m07.1s/4m00.0s

running (2m21.0s), 063/600 VUs, 1451 complete and 0 interrupted iterations
default   [  28% ] 063/600 VUs  1m08.1s/4m00.0s

running (2m22.0s), 065/600 VUs, 1507 complete and 0 interrupted iterations
default   [  29% ] 065/600 VUs  1m09.1s/4m00.0s

running (2m23.0s), 066/600 VUs, 1554 complete and 0 interrupted iterations
default   [  29% ] 066/600 VUs  1m10.1s/4m00.0s

running (2m24.0s), 068/600 VUs, 1610 complete and 0 interrupted iterations
default   [  30% ] 068/600 VUs  1m11.1s/4m00.0s

running (2m25.0s), 070/600 VUs, 1665 complete and 0 interrupted iterations
default   [  30% ] 070/600 VUs  1m12.1s/4m00.0s

running (2m26.0s), 071/600 VUs, 1717 complete and 0 interrupted iterations
default   [  30% ] 071/600 VUs  1m13.1s/4m00.0s

running (2m27.0s), 073/600 VUs, 1784 complete and 0 interrupted iterations
default   [  31% ] 073/600 VUs  1m14.1s/4m00.0s

running (2m28.0s), 075/600 VUs, 1836 complete and 0 interrupted iterations
default   [  31% ] 075/600 VUs  1m15.1s/4m00.0s

running (2m29.0s), 076/600 VUs, 1908 complete and 0 interrupted iterations
default   [  32% ] 076/600 VUs  1m16.1s/4m00.0s

running (2m30.0s), 078/600 VUs, 1970 complete and 0 interrupted iterations
default   [  32% ] 078/600 VUs  1m17.1s/4m00.0s

running (2m31.0s), 080/600 VUs, 2036 complete and 0 interrupted iterations
default   [  33% ] 080/600 VUs  1m18.1s/4m00.0s

running (2m32.0s), 081/600 VUs, 2105 complete and 0 interrupted iterations
default   [  33% ] 081/600 VUs  1m19.1s/4m00.0s

running (2m33.0s), 083/600 VUs, 2173 complete and 0 interrupted iterations
default   [  33% ] 083/600 VUs  1m20.1s/4m00.0s

running (2m34.0s), 085/600 VUs, 2254 complete and 0 interrupted iterations
default   [  34% ] 085/600 VUs  1m21.1s/4m00.0s

running (2m35.0s), 086/600 VUs, 2316 complete and 0 interrupted iterations
default   [  34% ] 086/600 VUs  1m22.1s/4m00.0s

running (2m36.0s), 088/600 VUs, 2394 complete and 0 interrupted iterations
default   [  35% ] 088/600 VUs  1m23.1s/4m00.0s

running (2m37.0s), 090/600 VUs, 2468 complete and 0 interrupted iterations
default   [  35% ] 090/600 VUs  1m24.1s/4m00.0s

running (2m38.0s), 091/600 VUs, 2546 complete and 0 interrupted iterations
default   [  35% ] 091/600 VUs  1m25.1s/4m00.0s

running (2m39.0s), 093/600 VUs, 2621 complete and 0 interrupted iterations
default   [  36% ] 093/600 VUs  1m26.1s/4m00.0s

running (2m40.0s), 095/600 VUs, 2702 complete and 0 interrupted iterations
default   [  36% ] 095/600 VUs  1m27.1s/4m00.0s

running (2m41.0s), 096/600 VUs, 2794 complete and 0 interrupted iterations
default   [  37% ] 096/600 VUs  1m28.1s/4m00.0s

running (2m42.0s), 098/600 VUs, 2864 complete and 0 interrupted iterations
default   [  37% ] 098/600 VUs  1m29.1s/4m00.0s

running (2m43.0s), 100/600 VUs, 2949 complete and 0 interrupted iterations
default   [  38% ] 100/600 VUs  1m30.1s/4m00.0s

running (2m44.0s), 103/600 VUs, 3035 complete and 0 interrupted iterations
default   [  38% ] 103/600 VUs  1m31.1s/4m00.0s

running (2m45.0s), 106/600 VUs, 3129 complete and 0 interrupted iterations
default   [  38% ] 106/600 VUs  1m32.1s/4m00.0s

running (2m46.0s), 110/600 VUs, 3205 complete and 0 interrupted iterations
default   [  39% ] 110/600 VUs  1m33.1s/4m00.0s

running (2m47.0s), 113/600 VUs, 3308 complete and 0 interrupted iterations
default   [  39% ] 113/600 VUs  1m34.1s/4m00.0s

running (2m48.0s), 116/600 VUs, 3417 complete and 0 interrupted iterations
default   [  40% ] 116/600 VUs  1m35.1s/4m00.0s

running (2m49.0s), 120/600 VUs, 3506 complete and 0 interrupted iterations
default   [  40% ] 120/600 VUs  1m36.1s/4m00.0s

running (2m50.0s), 123/600 VUs, 3616 complete and 0 interrupted iterations
default   [  40% ] 123/600 VUs  1m37.1s/4m00.0s

running (2m51.0s), 126/600 VUs, 3717 complete and 0 interrupted iterations
default   [  41% ] 126/600 VUs  1m38.1s/4m00.0s

running (2m52.0s), 130/600 VUs, 3818 complete and 0 interrupted iterations
default   [  41% ] 130/600 VUs  1m39.1s/4m00.0s

running (2m53.0s), 133/600 VUs, 3922 complete and 0 interrupted iterations
default   [  42% ] 133/600 VUs  1m40.1s/4m00.0s

running (2m54.0s), 136/600 VUs, 4049 complete and 0 interrupted iterations
default   [  42% ] 136/600 VUs  1m41.1s/4m00.0s

running (2m55.0s), 140/600 VUs, 4176 complete and 0 interrupted iterations
default   [  43% ] 140/600 VUs  1m42.1s/4m00.0s

running (2m56.0s), 143/600 VUs, 4286 complete and 0 interrupted iterations
default   [  43% ] 143/600 VUs  1m43.1s/4m00.0s

running (2m57.0s), 146/600 VUs, 4401 complete and 0 interrupted iterations
default   [  43% ] 146/600 VUs  1m44.1s/4m00.0s

running (2m58.0s), 150/600 VUs, 4528 complete and 0 interrupted iterations
default   [  44% ] 150/600 VUs  1m45.1s/4m00.0s
time="2026-05-28T18:14:18-03:00" level=warning msg="The test has generated metrics with 100227 unique time series, which is higher than the suggested limit of 100000 and could cause high memory usage. Consider not using high-cardinality values like unique IDs as metric tags or, if you need them in the URL, use the name metric tag or URL grouping. See https://grafana.com/docs/k6/latest/using-k6/tags-and-groups/ for details." component=metrics-engine-ingester

running (2m59.0s), 153/600 VUs, 4651 complete and 0 interrupted iterations
default   [  44% ] 153/600 VUs  1m46.1s/4m00.0s

running (3m00.0s), 156/600 VUs, 4782 complete and 0 interrupted iterations
default   [  45% ] 156/600 VUs  1m47.1s/4m00.0s

running (3m01.0s), 160/600 VUs, 4926 complete and 0 interrupted iterations
default   [  45% ] 160/600 VUs  1m48.1s/4m00.0s

running (3m02.0s), 163/600 VUs, 5062 complete and 0 interrupted iterations
default   [  45% ] 163/600 VUs  1m49.1s/4m00.0s

running (3m03.0s), 166/600 VUs, 5193 complete and 0 interrupted iterations
default   [  46% ] 166/600 VUs  1m50.1s/4m00.0s

running (3m04.0s), 170/600 VUs, 5343 complete and 0 interrupted iterations
default   [  46% ] 170/600 VUs  1m51.1s/4m00.0s

running (3m05.0s), 173/600 VUs, 5497 complete and 0 interrupted iterations
default   [  47% ] 173/600 VUs  1m52.1s/4m00.0s

running (3m06.0s), 176/600 VUs, 5637 complete and 0 interrupted iterations
default   [  47% ] 176/600 VUs  1m53.1s/4m00.0s

running (3m07.0s), 180/600 VUs, 5777 complete and 0 interrupted iterations
default   [  48% ] 180/600 VUs  1m54.1s/4m00.0s

running (3m08.0s), 183/600 VUs, 5944 complete and 0 interrupted iterations
default   [  48% ] 183/600 VUs  1m55.1s/4m00.0s

running (3m09.0s), 186/600 VUs, 6090 complete and 0 interrupted iterations
default   [  48% ] 186/600 VUs  1m56.1s/4m00.0s

running (3m10.0s), 190/600 VUs, 6249 complete and 0 interrupted iterations
default   [  49% ] 190/600 VUs  1m57.1s/4m00.0s

running (3m11.0s), 193/600 VUs, 6414 complete and 0 interrupted iterations
default   [  49% ] 193/600 VUs  1m58.1s/4m00.0s

running (3m12.0s), 196/600 VUs, 6579 complete and 0 interrupted iterations
default   [  50% ] 196/600 VUs  1m59.1s/4m00.0s

running (3m13.0s), 200/600 VUs, 6744 complete and 0 interrupted iterations
default   [  50% ] 200/600 VUs  2m00.1s/4m00.0s

running (3m14.0s), 203/600 VUs, 6912 complete and 0 interrupted iterations
default   [  50% ] 203/600 VUs  2m01.1s/4m00.0s

running (3m15.0s), 206/600 VUs, 7097 complete and 0 interrupted iterations
default   [  51% ] 206/600 VUs  2m02.1s/4m00.0s

running (3m16.0s), 210/600 VUs, 7260 complete and 0 interrupted iterations
default   [  51% ] 210/600 VUs  2m03.1s/4m00.0s

running (3m17.0s), 213/600 VUs, 7436 complete and 0 interrupted iterations
default   [  52% ] 213/600 VUs  2m04.1s/4m00.0s

running (3m18.0s), 216/600 VUs, 7626 complete and 0 interrupted iterations
default   [  52% ] 216/600 VUs  2m05.1s/4m00.0s

running (3m19.0s), 220/600 VUs, 7802 complete and 0 interrupted iterations
default   [  53% ] 220/600 VUs  2m06.1s/4m00.0s

running (3m20.0s), 223/600 VUs, 7975 complete and 0 interrupted iterations
default   [  53% ] 223/600 VUs  2m07.1s/4m00.0s

running (3m21.0s), 226/600 VUs, 8174 complete and 0 interrupted iterations
default   [  53% ] 226/600 VUs  2m08.1s/4m00.0s

running (3m22.0s), 230/600 VUs, 8354 complete and 0 interrupted iterations
default   [  54% ] 230/600 VUs  2m09.1s/4m00.0s

running (3m23.0s), 233/600 VUs, 8550 complete and 0 interrupted iterations
default   [  54% ] 233/600 VUs  2m10.1s/4m00.0s

running (3m24.0s), 236/600 VUs, 8763 complete and 0 interrupted iterations
default   [  55% ] 236/600 VUs  2m11.1s/4m00.0s

running (3m25.0s), 240/600 VUs, 8947 complete and 0 interrupted iterations
default   [  55% ] 240/600 VUs  2m12.1s/4m00.0s

running (3m26.0s), 243/600 VUs, 9144 complete and 0 interrupted iterations
default   [  55% ] 243/600 VUs  2m13.1s/4m00.0s

running (3m27.0s), 246/600 VUs, 9350 complete and 0 interrupted iterations
default   [  56% ] 246/600 VUs  2m14.1s/4m00.0s

running (3m28.0s), 250/600 VUs, 9549 complete and 0 interrupted iterations
default   [  56% ] 250/600 VUs  2m15.1s/4m00.0s

running (3m29.0s), 253/600 VUs, 9759 complete and 0 interrupted iterations
default   [  57% ] 253/600 VUs  2m16.1s/4m00.0s
time="2026-05-28T18:14:50-03:00" level=warning msg="The test has generated metrics with 200127 unique time series, which is higher than the suggested limit of 100000 and could cause high memory usage. Consider not using high-cardinality values like unique IDs as metric tags or, if you need them in the URL, use the name metric tag or URL grouping. See https://grafana.com/docs/k6/latest/using-k6/tags-and-groups/ for details." component=metrics-engine-ingester

running (3m30.0s), 256/600 VUs, 9978 complete and 0 interrupted iterations
default   [  57% ] 256/600 VUs  2m17.1s/4m00.0s

running (3m31.0s), 260/600 VUs, 10171 complete and 0 interrupted iterations
default   [  58% ] 260/600 VUs  2m18.1s/4m00.0s

running (3m32.0s), 263/600 VUs, 10388 complete and 0 interrupted iterations
default   [  58% ] 263/600 VUs  2m19.1s/4m00.0s

running (3m33.0s), 266/600 VUs, 10609 complete and 0 interrupted iterations
default   [  58% ] 266/600 VUs  2m20.1s/4m00.0s

running (3m34.0s), 270/600 VUs, 10830 complete and 0 interrupted iterations
default   [  59% ] 270/600 VUs  2m21.1s/4m00.0s

running (3m35.0s), 273/600 VUs, 11040 complete and 0 interrupted iterations
default   [  59% ] 273/600 VUs  2m22.1s/4m00.0s

running (3m36.0s), 276/600 VUs, 11270 complete and 0 interrupted iterations
default   [  60% ] 276/600 VUs  2m23.1s/4m00.0s

running (3m37.0s), 280/600 VUs, 11483 complete and 0 interrupted iterations
default   [  60% ] 280/600 VUs  2m24.1s/4m00.0s

running (3m38.0s), 283/600 VUs, 11710 complete and 0 interrupted iterations
default   [  60% ] 283/600 VUs  2m25.1s/4m00.0s

running (3m39.0s), 286/600 VUs, 11922 complete and 0 interrupted iterations
default   [  61% ] 286/600 VUs  2m26.1s/4m00.0s

running (3m40.0s), 290/600 VUs, 12166 complete and 0 interrupted iterations
default   [  61% ] 290/600 VUs  2m27.1s/4m00.0s

running (3m41.0s), 293/600 VUs, 12390 complete and 0 interrupted iterations
default   [  62% ] 293/600 VUs  2m28.1s/4m00.0s

running (3m42.0s), 296/600 VUs, 12620 complete and 0 interrupted iterations
default   [  62% ] 296/600 VUs  2m29.1s/4m00.0s

running (3m43.0s), 300/600 VUs, 12856 complete and 0 interrupted iterations
default   [  63% ] 300/600 VUs  2m30.1s/4m00.0s

running (3m44.0s), 303/600 VUs, 13084 complete and 0 interrupted iterations
default   [  63% ] 303/600 VUs  2m31.1s/4m00.0s

running (3m45.0s), 306/600 VUs, 13320 complete and 0 interrupted iterations
default   [  63% ] 306/600 VUs  2m32.1s/4m00.0s

running (3m46.0s), 310/600 VUs, 13544 complete and 0 interrupted iterations
default   [  64% ] 310/600 VUs  2m33.1s/4m00.0s

running (3m47.0s), 313/600 VUs, 13752 complete and 0 interrupted iterations
default   [  64% ] 313/600 VUs  2m34.1s/4m00.0s

running (3m48.0s), 316/600 VUs, 13979 complete and 0 interrupted iterations
default   [  65% ] 316/600 VUs  2m35.1s/4m00.0s

running (3m49.0s), 320/600 VUs, 14212 complete and 0 interrupted iterations
default   [  65% ] 320/600 VUs  2m36.1s/4m00.0s

running (3m50.0s), 323/600 VUs, 14436 complete and 0 interrupted iterations
default   [  65% ] 323/600 VUs  2m37.1s/4m00.0s

running (3m51.0s), 326/600 VUs, 14663 complete and 0 interrupted iterations
default   [  66% ] 326/600 VUs  2m38.1s/4m00.0s

running (3m52.0s), 330/600 VUs, 14886 complete and 0 interrupted iterations
default   [  66% ] 330/600 VUs  2m39.1s/4m00.0s

running (3m53.0s), 333/600 VUs, 15116 complete and 0 interrupted iterations
default   [  67% ] 333/600 VUs  2m40.1s/4m00.0s

running (3m54.0s), 336/600 VUs, 15356 complete and 0 interrupted iterations
default   [  67% ] 336/600 VUs  2m41.1s/4m00.0s

running (3m55.0s), 340/600 VUs, 15590 complete and 0 interrupted iterations
default   [  68% ] 340/600 VUs  2m42.1s/4m00.0s

running (3m56.0s), 343/600 VUs, 15825 complete and 0 interrupted iterations
default   [  68% ] 343/600 VUs  2m43.1s/4m00.0s

running (3m57.0s), 346/600 VUs, 16068 complete and 0 interrupted iterations
default   [  68% ] 346/600 VUs  2m44.1s/4m00.0s

running (3m58.0s), 350/600 VUs, 16301 complete and 0 interrupted iterations
default   [  69% ] 350/600 VUs  2m45.1s/4m00.0s

running (3m59.0s), 353/600 VUs, 16527 complete and 0 interrupted iterations
default   [  69% ] 353/600 VUs  2m46.1s/4m00.0s

running (4m00.0s), 356/600 VUs, 16773 complete and 0 interrupted iterations
default   [  70% ] 356/600 VUs  2m47.1s/4m00.0s

running (4m01.0s), 360/600 VUs, 17001 complete and 0 interrupted iterations
default   [  70% ] 360/600 VUs  2m48.1s/4m00.0s

running (4m02.0s), 363/600 VUs, 17225 complete and 0 interrupted iterations
default   [  70% ] 363/600 VUs  2m49.1s/4m00.0s

running (4m03.0s), 366/600 VUs, 17446 complete and 0 interrupted iterations
default   [  71% ] 366/600 VUs  2m50.1s/4m00.0s

running (4m04.0s), 370/600 VUs, 17695 complete and 0 interrupted iterations
default   [  71% ] 370/600 VUs  2m51.1s/4m00.0s

running (4m05.0s), 373/600 VUs, 17923 complete and 0 interrupted iterations
default   [  72% ] 373/600 VUs  2m52.1s/4m00.0s

running (4m06.0s), 376/600 VUs, 18151 complete and 0 interrupted iterations
default   [  72% ] 376/600 VUs  2m53.1s/4m00.0s

running (4m07.0s), 380/600 VUs, 18392 complete and 0 interrupted iterations
default   [  73% ] 380/600 VUs  2m54.1s/4m00.0s

running (4m08.0s), 383/600 VUs, 18632 complete and 0 interrupted iterations
default   [  73% ] 383/600 VUs  2m55.1s/4m00.0s

running (4m09.0s), 386/600 VUs, 18864 complete and 0 interrupted iterations
default   [  73% ] 386/600 VUs  2m56.1s/4m00.0s

running (4m10.0s), 390/600 VUs, 19092 complete and 0 interrupted iterations
default   [  74% ] 390/600 VUs  2m57.1s/4m00.0s

running (4m11.0s), 393/600 VUs, 19316 complete and 0 interrupted iterations
default   [  74% ] 393/600 VUs  2m58.1s/4m00.0s

running (4m12.0s), 396/600 VUs, 19546 complete and 0 interrupted iterations
default   [  75% ] 396/600 VUs  2m59.1s/4m00.0s

running (4m13.0s), 400/600 VUs, 19760 complete and 0 interrupted iterations
default   [  75% ] 400/600 VUs  3m00.1s/4m00.0s

running (4m14.0s), 407/600 VUs, 20008 complete and 0 interrupted iterations
default   [  75% ] 407/600 VUs  3m01.1s/4m00.0s

running (4m15.0s), 413/600 VUs, 20216 complete and 0 interrupted iterations
default   [  76% ] 413/600 VUs  3m02.1s/4m00.0s

running (4m16.0s), 420/600 VUs, 20465 complete and 0 interrupted iterations
default   [  76% ] 420/600 VUs  3m03.1s/4m00.0s

running (4m17.0s), 427/600 VUs, 20681 complete and 0 interrupted iterations
default   [  77% ] 427/600 VUs  3m04.1s/4m00.0s
time="2026-05-28T18:15:38-03:00" level=warning msg="The test has generated metrics with 400017 unique time series, which is higher than the suggested limit of 100000 and could cause high memory usage. Consider not using high-cardinality values like unique IDs as metric tags or, if you need them in the URL, use the name metric tag or URL grouping. See https://grafana.com/docs/k6/latest/using-k6/tags-and-groups/ for details." component=metrics-engine-ingester

running (4m18.0s), 433/600 VUs, 20899 complete and 0 interrupted iterations
default   [  77% ] 433/600 VUs  3m05.1s/4m00.0s

running (4m19.0s), 440/600 VUs, 21107 complete and 0 interrupted iterations
default   [  78% ] 440/600 VUs  3m06.1s/4m00.0s

running (4m20.0s), 447/600 VUs, 21353 complete and 0 interrupted iterations
default   [  78% ] 447/600 VUs  3m07.1s/4m00.0s

running (4m21.0s), 453/600 VUs, 21569 complete and 0 interrupted iterations
default   [  78% ] 453/600 VUs  3m08.1s/4m00.0s

running (4m22.0s), 460/600 VUs, 21802 complete and 0 interrupted iterations
default   [  79% ] 460/600 VUs  3m09.1s/4m00.0s

running (4m23.0s), 467/600 VUs, 22013 complete and 0 interrupted iterations
default   [  79% ] 467/600 VUs  3m10.1s/4m00.0s

running (4m24.0s), 473/600 VUs, 22256 complete and 0 interrupted iterations
default   [  80% ] 473/600 VUs  3m11.1s/4m00.0s

running (4m25.0s), 480/600 VUs, 22484 complete and 0 interrupted iterations
default   [  80% ] 480/600 VUs  3m12.1s/4m00.0s

running (4m26.0s), 487/600 VUs, 22710 complete and 0 interrupted iterations
default   [  80% ] 487/600 VUs  3m13.1s/4m00.0s

running (4m27.0s), 493/600 VUs, 22957 complete and 0 interrupted iterations
default   [  81% ] 493/600 VUs  3m14.1s/4m00.0s

running (4m28.0s), 500/600 VUs, 23186 complete and 0 interrupted iterations
default   [  81% ] 500/600 VUs  3m15.1s/4m00.0s

running (4m29.0s), 507/600 VUs, 23405 complete and 0 interrupted iterations
default   [  82% ] 507/600 VUs  3m16.1s/4m00.0s

running (4m30.0s), 513/600 VUs, 23643 complete and 0 interrupted iterations
default   [  82% ] 513/600 VUs  3m17.1s/4m00.0s

running (4m31.0s), 520/600 VUs, 23852 complete and 0 interrupted iterations
default   [  83% ] 520/600 VUs  3m18.1s/4m00.0s

running (4m32.0s), 527/600 VUs, 24080 complete and 0 interrupted iterations
default   [  83% ] 527/600 VUs  3m19.1s/4m00.0s

running (4m33.0s), 533/600 VUs, 24311 complete and 0 interrupted iterations
default   [  83% ] 533/600 VUs  3m20.1s/4m00.0s

running (4m34.0s), 540/600 VUs, 24509 complete and 0 interrupted iterations
default   [  84% ] 540/600 VUs  3m21.1s/4m00.0s

running (4m35.0s), 547/600 VUs, 24747 complete and 0 interrupted iterations
default   [  84% ] 547/600 VUs  3m22.1s/4m00.0s

running (4m36.0s), 553/600 VUs, 24932 complete and 0 interrupted iterations
default   [  85% ] 553/600 VUs  3m23.1s/4m00.0s

running (4m37.0s), 560/600 VUs, 25167 complete and 0 interrupted iterations
default   [  85% ] 560/600 VUs  3m24.1s/4m00.0s

running (4m38.0s), 567/600 VUs, 25437 complete and 0 interrupted iterations
default   [  85% ] 567/600 VUs  3m25.1s/4m00.0s

running (4m39.0s), 573/600 VUs, 25626 complete and 0 interrupted iterations
default   [  86% ] 573/600 VUs  3m26.1s/4m00.0s

running (4m40.0s), 580/600 VUs, 25863 complete and 0 interrupted iterations
default   [  86% ] 580/600 VUs  3m27.1s/4m00.0s

running (4m41.0s), 587/600 VUs, 26093 complete and 0 interrupted iterations
default   [  87% ] 587/600 VUs  3m28.1s/4m00.0s

running (4m42.0s), 593/600 VUs, 26289 complete and 0 interrupted iterations
default   [  87% ] 593/600 VUs  3m29.1s/4m00.0s

running (4m43.0s), 600/600 VUs, 26542 complete and 0 interrupted iterations
default   [  88% ] 600/600 VUs  3m30.1s/4m00.0s

running (4m44.0s), 595/600 VUs, 26762 complete and 0 interrupted iterations
default   [  88% ] 595/600 VUs  3m31.1s/4m00.0s

running (4m45.0s), 585/600 VUs, 26998 complete and 0 interrupted iterations
default   [  88% ] 585/600 VUs  3m32.1s/4m00.0s

running (4m46.0s), 566/600 VUs, 27235 complete and 0 interrupted iterations
default   [  89% ] 566/600 VUs  3m33.1s/4m00.0s

running (4m47.0s), 544/600 VUs, 27465 complete and 0 interrupted iterations
default   [  89% ] 544/600 VUs  3m34.1s/4m00.0s

running (4m48.0s), 518/600 VUs, 27730 complete and 0 interrupted iterations
default   [  90% ] 518/600 VUs  3m35.1s/4m00.0s

running (4m49.0s), 499/600 VUs, 27948 complete and 0 interrupted iterations
default   [  90% ] 499/600 VUs  3m36.1s/4m00.0s

running (4m50.0s), 486/600 VUs, 28190 complete and 0 interrupted iterations
default   [  90% ] 486/600 VUs  3m37.1s/4m00.0s

running (4m51.0s), 458/600 VUs, 28423 complete and 0 interrupted iterations
default   [  91% ] 458/600 VUs  3m38.1s/4m00.0s

running (4m52.0s), 434/600 VUs, 28685 complete and 0 interrupted iterations
default   [  91% ] 434/600 VUs  3m39.1s/4m00.0s

running (4m53.0s), 421/600 VUs, 28891 complete and 0 interrupted iterations
default   [  92% ] 421/600 VUs  3m40.1s/4m00.0s

running (4m54.0s), 394/600 VUs, 29170 complete and 0 interrupted iterations
default   [  92% ] 394/600 VUs  3m41.1s/4m00.0s

running (4m55.0s), 378/600 VUs, 29389 complete and 0 interrupted iterations
default   [  93% ] 378/600 VUs  3m42.1s/4m00.0s

running (4m56.0s), 353/600 VUs, 29639 complete and 0 interrupted iterations
default   [  93% ] 353/600 VUs  3m43.1s/4m00.0s

running (4m57.0s), 334/600 VUs, 29874 complete and 0 interrupted iterations
default   [  93% ] 334/600 VUs  3m44.1s/4m00.0s

running (4m58.0s), 314/600 VUs, 30092 complete and 0 interrupted iterations
default   [  94% ] 314/600 VUs  3m45.1s/4m00.0s

running (4m59.0s), 292/600 VUs, 30327 complete and 0 interrupted iterations
default   [  94% ] 292/600 VUs  3m46.1s/4m00.0s

running (5m00.0s), 273/600 VUs, 30564 complete and 0 interrupted iterations
default   [  95% ] 273/600 VUs  3m47.1s/4m00.0s

running (5m01.0s), 249/600 VUs, 30786 complete and 0 interrupted iterations
default   [  95% ] 249/600 VUs  3m48.1s/4m00.0s

running (5m02.0s), 229/600 VUs, 31004 complete and 0 interrupted iterations
default   [  95% ] 229/600 VUs  3m49.1s/4m00.0s

running (5m03.0s), 209/600 VUs, 31194 complete and 0 interrupted iterations
default   [  96% ] 209/600 VUs  3m50.1s/4m00.0s

running (5m04.0s), 194/600 VUs, 31378 complete and 0 interrupted iterations
default   [  96% ] 194/600 VUs  3m51.1s/4m00.0s

running (5m05.0s), 170/600 VUs, 31546 complete and 0 interrupted iterations
default   [  97% ] 170/600 VUs  3m52.1s/4m00.0s

running (5m06.0s), 151/600 VUs, 31690 complete and 0 interrupted iterations
default   [  97% ] 151/600 VUs  3m53.1s/4m00.0s

running (5m07.0s), 132/600 VUs, 31824 complete and 0 interrupted iterations
default   [  98% ] 132/600 VUs  3m54.1s/4m00.0s

running (5m08.0s), 113/600 VUs, 31933 complete and 0 interrupted iterations
default   [  98% ] 113/600 VUs  3m55.1s/4m00.0s

running (5m09.0s), 092/600 VUs, 32031 complete and 0 interrupted iterations
default   [  98% ] 092/600 VUs  3m56.1s/4m00.0s

running (5m10.0s), 069/600 VUs, 32117 complete and 0 interrupted iterations
default   [  99% ] 069/600 VUs  3m57.1s/4m00.0s

running (5m11.0s), 050/600 VUs, 32180 complete and 0 interrupted iterations
default   [  99% ] 050/600 VUs  3m58.1s/4m00.0s

running (5m12.0s), 034/600 VUs, 32223 complete and 0 interrupted iterations
default   [ 100% ] 034/600 VUs  3m59.1s/4m00.0s

running (5m13.0s), 014/600 VUs, 32251 complete and 0 interrupted iterations
default ↓ [ 100% ] 015/600 VUs  4m0s

running (5m14.0s), 000/600 VUs, 32265 complete and 0 interrupted iterations
default ✓ [ 100% ] 000/600 VUs  4m0s


  █ THRESHOLDS 

    http_req_duration
    ✓ 'p(95)<2500' p(95)=353.67ms

    http_req_failed
    ✓ 'rate<0.05' rate=0.00%


  █ TOTAL RESULTS 

    checks_total.......: 129060  411.074454/s
    checks_succeeded...: 100.00% 129060 out of 129060
    checks_failed......: 0.00%   0 out of 129060

    ✓ like 200
    ✓ list 200
    ✓ reply 201
    ✓ delete 204

    HTTP
    http_req_duration..............: avg=112.31ms min=2.72ms med=56.4ms max=970.62ms p(90)=299.59ms p(95)=353.67ms
      { expected_response:true }...: avg=112.31ms min=2.72ms med=56.4ms max=970.62ms p(90)=299.59ms p(95)=353.67ms
    http_req_failed................: 0.00%  0 out of 133860
    http_reqs......................: 133860 426.363137/s

    EXECUTION
    iteration_duration.............: avg=1.56s    min=1.12s  med=1.37s  max=3.33s    p(90)=2.33s    p(95)=2.52s   
    iterations.....................: 32265  102.768614/s
    vus............................: 14     min=0           max=600
    vus_max........................: 600    min=600         max=600

    NETWORK
    data_received..................: 62 MB  196 kB/s
    data_sent......................: 54 MB  172 kB/s




running (5m14.0s), 000/600 VUs, 32265 complete and 0 interrupted iterations
default ✓ [ 100% ] 000/600 VUs  4m0s

================================================================
% cd DomainFeed/review && k6 run review-load.js
================================================================


         /\      Grafana   /‾‾/  
    /\  /  \     |\  __   /  /   
   /  \/    \    | |/ /  /   ‾‾\ 
  /          \   |   (  |  (‾)  |
 / __________ \  |_|\_\  \_____/ 


     execution: local
        script: review-load.js
        output: -

     scenarios: (100.00%) 2 scenarios, 210 max VUs, 2m30s max duration (incl. graceful stop):
              * crud: 158 looping VUs for 2m0s (exec: crudReview, gracefulStop: 30s)
              * listing: 52 looping VUs for 2m0s (exec: listReviews, gracefulStop: 30s)


Run       [ 100% ] setup()
crud      [   0% ]
listing   [   0% ]

Run       [ 100% ] setup()
crud      [   0% ]
listing   [   0% ]

Run       [ 100% ] setup()
crud      [   0% ]
listing   [   0% ]

Run       [ 100% ] setup()
crud      [   0% ]
listing   [   0% ]

Run       [ 100% ] setup()
crud      [   0% ]
listing   [   0% ]

Run       [ 100% ] setup()
crud      [   0% ]
listing   [   0% ]

Run       [ 100% ] setup()
crud      [   0% ]
listing   [   0% ]

Run       [ 100% ] setup()
crud      [   0% ]
listing   [   0% ]

Run       [ 100% ] setup()
crud      [   0% ]
listing   [   0% ]

Run       [ 100% ] setup()
crud      [   0% ]
listing   [   0% ]

Run       [ 100% ] setup()
crud      [   0% ]
listing   [   0% ]

Run       [ 100% ] setup()
crud      [   0% ]
listing   [   0% ]

Run       [ 100% ] setup()
crud      [   0% ]
listing   [   0% ]

Run       [ 100% ] setup()
crud      [   0% ]
listing   [   0% ]

Run       [ 100% ] setup()
crud      [   0% ]
listing   [   0% ]

Run       [ 100% ] setup()
crud      [   0% ]
listing   [   0% ]

Run       [ 100% ] setup()
crud      [   0% ]
listing   [   0% ]

Run       [ 100% ] setup()
crud      [   0% ]
listing   [   0% ]

Run       [ 100% ] setup()
crud      [   0% ]
listing   [   0% ]

Run       [ 100% ] setup()
crud      [   0% ]
listing   [   0% ]

Run       [ 100% ] setup()
crud      [   0% ]
listing   [   0% ]

Run       [ 100% ] setup()
crud      [   0% ]
listing   [   0% ]

Run       [ 100% ] setup()
crud      [   0% ]
listing   [   0% ]

Run       [ 100% ] setup()
crud      [   0% ]
listing   [   0% ]

Run       [ 100% ] setup()
crud      [   0% ]
listing   [   0% ]

Run       [ 100% ] setup()
crud      [   0% ]
listing   [   0% ]

Run       [ 100% ] setup()
crud      [   0% ]
listing   [   0% ]

Run       [ 100% ] setup()
crud      [   0% ]
listing   [   0% ]

Run       [ 100% ] setup()
crud      [   0% ]
listing   [   0% ]
time="2026-05-28T18:17:04-03:00" level=info msg="Setup concluído: 230 usuários prontos de 230 tentativas." source=console

running (0m30.0s), 210/210 VUs, 34 complete and 0 interrupted iterations
crud      [   1% ] 158 VUs  0m00.7s/2m0s
listing   [   1% ] 52 VUs   0m00.7s/2m0s

running (0m31.0s), 210/210 VUs, 132 complete and 0 interrupted iterations
crud      [   1% ] 158 VUs  0m01.7s/2m0s
listing   [   1% ] 52 VUs   0m01.7s/2m0s

running (0m32.0s), 210/210 VUs, 387 complete and 0 interrupted iterations
crud      [   2% ] 158 VUs  0m02.7s/2m0s
listing   [   2% ] 52 VUs   0m02.7s/2m0s

running (0m33.0s), 210/210 VUs, 476 complete and 0 interrupted iterations
crud      [   3% ] 158 VUs  0m03.7s/2m0s
listing   [   3% ] 52 VUs   0m03.7s/2m0s

running (0m34.0s), 210/210 VUs, 736 complete and 0 interrupted iterations
crud      [   4% ] 158 VUs  0m04.7s/2m0s
listing   [   4% ] 52 VUs   0m04.7s/2m0s

running (0m35.0s), 210/210 VUs, 838 complete and 0 interrupted iterations
crud      [   5% ] 158 VUs  0m05.7s/2m0s
listing   [   5% ] 52 VUs   0m05.7s/2m0s

running (0m36.0s), 210/210 VUs, 1099 complete and 0 interrupted iterations
crud      [   6% ] 158 VUs  0m06.7s/2m0s
listing   [   6% ] 52 VUs   0m06.7s/2m0s

running (0m37.0s), 210/210 VUs, 1203 complete and 0 interrupted iterations
crud      [   6% ] 158 VUs  0m07.7s/2m0s
listing   [   6% ] 52 VUs   0m07.7s/2m0s

running (0m38.0s), 210/210 VUs, 1464 complete and 0 interrupted iterations
crud      [   7% ] 158 VUs  0m08.7s/2m0s
listing   [   7% ] 52 VUs   0m08.7s/2m0s

running (0m39.0s), 210/210 VUs, 1568 complete and 0 interrupted iterations
crud      [   8% ] 158 VUs  0m09.7s/2m0s
listing   [   8% ] 52 VUs   0m09.7s/2m0s

running (0m40.0s), 210/210 VUs, 1830 complete and 0 interrupted iterations
crud      [   9% ] 158 VUs  0m10.7s/2m0s
listing   [   9% ] 52 VUs   0m10.7s/2m0s

running (0m41.0s), 210/210 VUs, 1934 complete and 0 interrupted iterations
crud      [  10% ] 158 VUs  0m11.7s/2m0s
listing   [  10% ] 52 VUs   0m11.7s/2m0s

running (0m42.0s), 210/210 VUs, 2196 complete and 0 interrupted iterations
crud      [  11% ] 158 VUs  0m12.7s/2m0s
listing   [  11% ] 52 VUs   0m12.7s/2m0s

running (0m43.0s), 210/210 VUs, 2300 complete and 0 interrupted iterations
crud      [  11% ] 158 VUs  0m13.7s/2m0s
listing   [  11% ] 52 VUs   0m13.7s/2m0s

running (0m44.0s), 210/210 VUs, 2562 complete and 0 interrupted iterations
crud      [  12% ] 158 VUs  0m14.7s/2m0s
listing   [  12% ] 52 VUs   0m14.7s/2m0s

running (0m45.0s), 210/210 VUs, 2661 complete and 0 interrupted iterations
crud      [  13% ] 158 VUs  0m15.7s/2m0s
listing   [  13% ] 52 VUs   0m15.7s/2m0s

running (0m46.0s), 210/210 VUs, 2918 complete and 0 interrupted iterations
crud      [  14% ] 158 VUs  0m16.7s/2m0s
listing   [  14% ] 52 VUs   0m16.7s/2m0s

running (0m47.0s), 210/210 VUs, 3020 complete and 0 interrupted iterations
crud      [  15% ] 158 VUs  0m17.7s/2m0s
listing   [  15% ] 52 VUs   0m17.7s/2m0s

running (0m48.0s), 210/210 VUs, 3282 complete and 0 interrupted iterations
crud      [  16% ] 158 VUs  0m18.7s/2m0s
listing   [  16% ] 52 VUs   0m18.7s/2m0s

running (0m49.0s), 210/210 VUs, 3378 complete and 0 interrupted iterations
crud      [  16% ] 158 VUs  0m19.7s/2m0s
listing   [  16% ] 52 VUs   0m19.7s/2m0s

running (0m50.0s), 210/210 VUs, 3640 complete and 0 interrupted iterations
crud      [  17% ] 158 VUs  0m20.7s/2m0s
listing   [  17% ] 52 VUs   0m20.7s/2m0s

running (0m51.0s), 210/210 VUs, 3735 complete and 0 interrupted iterations
crud      [  18% ] 158 VUs  0m21.7s/2m0s
listing   [  18% ] 52 VUs   0m21.7s/2m0s

running (0m52.0s), 210/210 VUs, 3994 complete and 0 interrupted iterations
crud      [  19% ] 158 VUs  0m22.7s/2m0s
listing   [  19% ] 52 VUs   0m22.7s/2m0s

running (0m53.0s), 210/210 VUs, 4092 complete and 0 interrupted iterations
crud      [  20% ] 158 VUs  0m23.7s/2m0s
listing   [  20% ] 52 VUs   0m23.7s/2m0s

running (0m54.0s), 210/210 VUs, 4349 complete and 0 interrupted iterations
crud      [  21% ] 158 VUs  0m24.7s/2m0s
listing   [  21% ] 52 VUs   0m24.7s/2m0s

running (0m55.0s), 210/210 VUs, 4453 complete and 0 interrupted iterations
crud      [  21% ] 158 VUs  0m25.7s/2m0s
listing   [  21% ] 52 VUs   0m25.7s/2m0s

running (0m56.0s), 210/210 VUs, 4712 complete and 0 interrupted iterations
crud      [  22% ] 158 VUs  0m26.7s/2m0s
listing   [  22% ] 52 VUs   0m26.7s/2m0s

running (0m57.0s), 210/210 VUs, 4815 complete and 0 interrupted iterations
crud      [  23% ] 158 VUs  0m27.7s/2m0s
listing   [  23% ] 52 VUs   0m27.7s/2m0s

running (0m58.0s), 210/210 VUs, 5076 complete and 0 interrupted iterations
crud      [  24% ] 158 VUs  0m28.7s/2m0s
listing   [  24% ] 52 VUs   0m28.7s/2m0s

running (0m59.0s), 210/210 VUs, 5180 complete and 0 interrupted iterations
crud      [  25% ] 158 VUs  0m29.7s/2m0s
listing   [  25% ] 52 VUs   0m29.7s/2m0s

running (1m00.0s), 210/210 VUs, 5439 complete and 0 interrupted iterations
crud      [  26% ] 158 VUs  0m30.7s/2m0s
listing   [  26% ] 52 VUs   0m30.7s/2m0s

running (1m01.0s), 210/210 VUs, 5543 complete and 0 interrupted iterations
crud      [  26% ] 158 VUs  0m31.7s/2m0s
listing   [  26% ] 52 VUs   0m31.7s/2m0s

running (1m02.0s), 210/210 VUs, 5804 complete and 0 interrupted iterations
crud      [  27% ] 158 VUs  0m32.7s/2m0s
listing   [  27% ] 52 VUs   0m32.7s/2m0s

running (1m03.0s), 210/210 VUs, 5912 complete and 0 interrupted iterations
crud      [  28% ] 158 VUs  0m33.7s/2m0s
listing   [  28% ] 52 VUs   0m33.7s/2m0s
time="2026-05-28T18:17:38-03:00" level=warning msg="The test has generated metrics with 100093 unique time series, which is higher than the suggested limit of 100000 and could cause high memory usage. Consider not using high-cardinality values like unique IDs as metric tags or, if you need them in the URL, use the name metric tag or URL grouping. See https://grafana.com/docs/k6/latest/using-k6/tags-and-groups/ for details." component=metrics-engine-ingester

running (1m04.0s), 210/210 VUs, 6170 complete and 0 interrupted iterations
crud      [  29% ] 158 VUs  0m34.7s/2m0s
listing   [  29% ] 52 VUs   0m34.7s/2m0s

running (1m05.0s), 210/210 VUs, 6278 complete and 0 interrupted iterations
crud      [  30% ] 158 VUs  0m35.7s/2m0s
listing   [  30% ] 52 VUs   0m35.7s/2m0s

running (1m06.0s), 210/210 VUs, 6535 complete and 0 interrupted iterations
crud      [  31% ] 158 VUs  0m36.7s/2m0s
listing   [  31% ] 52 VUs   0m36.7s/2m0s

running (1m07.0s), 210/210 VUs, 6642 complete and 0 interrupted iterations
crud      [  31% ] 158 VUs  0m37.7s/2m0s
listing   [  31% ] 52 VUs   0m37.7s/2m0s

running (1m08.0s), 210/210 VUs, 6892 complete and 0 interrupted iterations
crud      [  32% ] 158 VUs  0m38.7s/2m0s
listing   [  32% ] 52 VUs   0m38.7s/2m0s

running (1m09.0s), 210/210 VUs, 7004 complete and 0 interrupted iterations
crud      [  33% ] 158 VUs  0m39.7s/2m0s
listing   [  33% ] 52 VUs   0m39.7s/2m0s

running (1m10.0s), 210/210 VUs, 7258 complete and 0 interrupted iterations
crud      [  34% ] 158 VUs  0m40.7s/2m0s
listing   [  34% ] 52 VUs   0m40.7s/2m0s

running (1m11.0s), 210/210 VUs, 7365 complete and 0 interrupted iterations
crud      [  35% ] 158 VUs  0m41.7s/2m0s
listing   [  35% ] 52 VUs   0m41.7s/2m0s

running (1m12.0s), 210/210 VUs, 7616 complete and 0 interrupted iterations
crud      [  36% ] 158 VUs  0m42.7s/2m0s
listing   [  36% ] 52 VUs   0m42.7s/2m0s

running (1m13.0s), 210/210 VUs, 7717 complete and 0 interrupted iterations
crud      [  36% ] 158 VUs  0m43.7s/2m0s
listing   [  36% ] 52 VUs   0m43.7s/2m0s

running (1m14.0s), 210/210 VUs, 7960 complete and 0 interrupted iterations
crud      [  37% ] 158 VUs  0m44.7s/2m0s
listing   [  37% ] 52 VUs   0m44.7s/2m0s

running (1m15.0s), 210/210 VUs, 8043 complete and 0 interrupted iterations
crud      [  38% ] 158 VUs  0m45.7s/2m0s
listing   [  38% ] 52 VUs   0m45.7s/2m0s

running (1m16.0s), 210/210 VUs, 8293 complete and 0 interrupted iterations
crud      [  39% ] 158 VUs  0m46.7s/2m0s
listing   [  39% ] 52 VUs   0m46.7s/2m0s

running (1m17.0s), 210/210 VUs, 8407 complete and 0 interrupted iterations
crud      [  40% ] 158 VUs  0m47.7s/2m0s
listing   [  40% ] 52 VUs   0m47.7s/2m0s

running (1m18.0s), 210/210 VUs, 8657 complete and 0 interrupted iterations
crud      [  41% ] 158 VUs  0m48.7s/2m0s
listing   [  41% ] 52 VUs   0m48.7s/2m0s

running (1m19.0s), 210/210 VUs, 8771 complete and 0 interrupted iterations
crud      [  41% ] 158 VUs  0m49.7s/2m0s
listing   [  41% ] 52 VUs   0m49.7s/2m0s

running (1m20.0s), 210/210 VUs, 9020 complete and 0 interrupted iterations
crud      [  42% ] 158 VUs  0m50.7s/2m0s
listing   [  42% ] 52 VUs   0m50.7s/2m0s

running (1m21.0s), 210/210 VUs, 9134 complete and 0 interrupted iterations
crud      [  43% ] 158 VUs  0m51.7s/2m0s
listing   [  43% ] 52 VUs   0m51.7s/2m0s

running (1m22.0s), 210/210 VUs, 9379 complete and 0 interrupted iterations
crud      [  44% ] 158 VUs  0m52.7s/2m0s
listing   [  44% ] 52 VUs   0m52.7s/2m0s

running (1m23.0s), 210/210 VUs, 9495 complete and 0 interrupted iterations
crud      [  45% ] 158 VUs  0m53.7s/2m0s
listing   [  45% ] 52 VUs   0m53.7s/2m0s

running (1m24.0s), 210/210 VUs, 9745 complete and 0 interrupted iterations
crud      [  46% ] 158 VUs  0m54.7s/2m0s
listing   [  46% ] 52 VUs   0m54.7s/2m0s

running (1m25.0s), 210/210 VUs, 9821 complete and 0 interrupted iterations
crud      [  46% ] 158 VUs  0m55.7s/2m0s
listing   [  46% ] 52 VUs   0m55.7s/2m0s

running (1m26.0s), 210/210 VUs, 9836 complete and 0 interrupted iterations
crud      [  47% ] 158 VUs  0m56.7s/2m0s
listing   [  47% ] 52 VUs   0m56.7s/2m0s

running (1m27.0s), 210/210 VUs, 9845 complete and 0 interrupted iterations
crud      [  48% ] 158 VUs  0m57.7s/2m0s
listing   [  48% ] 52 VUs   0m57.7s/2m0s

running (1m28.0s), 210/210 VUs, 9863 complete and 0 interrupted iterations
crud      [  49% ] 158 VUs  0m58.7s/2m0s
listing   [  49% ] 52 VUs   0m58.7s/2m0s

running (1m29.0s), 210/210 VUs, 9886 complete and 0 interrupted iterations
crud      [  50% ] 158 VUs  0m59.7s/2m0s
listing   [  50% ] 52 VUs   0m59.7s/2m0s

running (1m30.0s), 210/210 VUs, 9958 complete and 0 interrupted iterations
crud      [  51% ] 158 VUs  1m00.7s/2m0s
listing   [  51% ] 52 VUs   1m00.7s/2m0s

running (1m31.0s), 210/210 VUs, 10175 complete and 0 interrupted iterations
crud      [  51% ] 158 VUs  1m01.7s/2m0s
listing   [  51% ] 52 VUs   1m01.7s/2m0s

running (1m32.0s), 210/210 VUs, 10324 complete and 0 interrupted iterations
crud      [  52% ] 158 VUs  1m02.7s/2m0s
listing   [  52% ] 52 VUs   1m02.7s/2m0s

running (1m33.0s), 210/210 VUs, 10536 complete and 0 interrupted iterations
crud      [  53% ] 158 VUs  1m03.7s/2m0s
listing   [  53% ] 52 VUs   1m03.7s/2m0s

running (1m34.0s), 210/210 VUs, 10670 complete and 0 interrupted iterations
crud      [  54% ] 158 VUs  1m04.7s/2m0s
listing   [  54% ] 52 VUs   1m04.7s/2m0s

running (1m35.0s), 210/210 VUs, 10878 complete and 0 interrupted iterations
crud      [  55% ] 158 VUs  1m05.7s/2m0s
listing   [  55% ] 52 VUs   1m05.7s/2m0s

running (1m36.0s), 210/210 VUs, 10989 complete and 0 interrupted iterations
crud      [  56% ] 158 VUs  1m06.7s/2m0s
listing   [  56% ] 52 VUs   1m06.7s/2m0s

running (1m37.0s), 210/210 VUs, 11036 complete and 0 interrupted iterations
crud      [  56% ] 158 VUs  1m07.7s/2m0s
listing   [  56% ] 52 VUs   1m07.7s/2m0s

running (1m38.0s), 210/210 VUs, 11143 complete and 0 interrupted iterations
crud      [  57% ] 158 VUs  1m08.7s/2m0s
listing   [  57% ] 52 VUs   1m08.7s/2m0s

running (1m39.0s), 210/210 VUs, 11336 complete and 0 interrupted iterations
crud      [  58% ] 158 VUs  1m09.7s/2m0s
listing   [  58% ] 52 VUs   1m09.7s/2m0s

running (1m40.0s), 210/210 VUs, 11506 complete and 0 interrupted iterations
crud      [  59% ] 158 VUs  1m10.7s/2m0s
listing   [  59% ] 52 VUs   1m10.7s/2m0s

running (1m41.0s), 210/210 VUs, 11694 complete and 0 interrupted iterations
crud      [  60% ] 158 VUs  1m11.7s/2m0s
listing   [  60% ] 52 VUs   1m11.7s/2m0s

running (1m42.0s), 210/210 VUs, 11871 complete and 0 interrupted iterations
crud      [  61% ] 158 VUs  1m12.7s/2m0s
listing   [  61% ] 52 VUs   1m12.7s/2m0s

running (1m43.0s), 210/210 VUs, 12049 complete and 0 interrupted iterations
crud      [  61% ] 158 VUs  1m13.7s/2m0s
listing   [  61% ] 52 VUs   1m13.7s/2m0s

running (1m44.0s), 210/210 VUs, 12236 complete and 0 interrupted iterations
crud      [  62% ] 158 VUs  1m14.7s/2m0s
listing   [  62% ] 52 VUs   1m14.7s/2m0s
time="2026-05-28T18:18:19-03:00" level=warning msg="The test has generated metrics with 200074 unique time series, which is higher than the suggested limit of 100000 and could cause high memory usage. Consider not using high-cardinality values like unique IDs as metric tags or, if you need them in the URL, use the name metric tag or URL grouping. See https://grafana.com/docs/k6/latest/using-k6/tags-and-groups/ for details." component=metrics-engine-ingester

running (1m45.0s), 210/210 VUs, 12420 complete and 0 interrupted iterations
crud      [  63% ] 158 VUs  1m15.7s/2m0s
listing   [  63% ] 52 VUs   1m15.7s/2m0s

running (1m46.0s), 210/210 VUs, 12491 complete and 0 interrupted iterations
crud      [  64% ] 158 VUs  1m16.7s/2m0s
listing   [  64% ] 52 VUs   1m16.7s/2m0s

running (1m47.0s), 210/210 VUs, 12508 complete and 0 interrupted iterations
crud      [  65% ] 158 VUs  1m17.7s/2m0s
listing   [  65% ] 52 VUs   1m17.7s/2m0s

running (1m48.0s), 210/210 VUs, 12540 complete and 0 interrupted iterations
crud      [  66% ] 158 VUs  1m18.7s/2m0s
listing   [  66% ] 52 VUs   1m18.7s/2m0s

running (1m49.0s), 210/210 VUs, 12566 complete and 0 interrupted iterations
crud      [  66% ] 158 VUs  1m19.7s/2m0s
listing   [  66% ] 52 VUs   1m19.7s/2m0s

running (1m50.0s), 210/210 VUs, 12575 complete and 0 interrupted iterations
crud      [  67% ] 158 VUs  1m20.7s/2m0s
listing   [  67% ] 52 VUs   1m20.7s/2m0s

running (1m51.0s), 210/210 VUs, 12608 complete and 0 interrupted iterations
crud      [  68% ] 158 VUs  1m21.7s/2m0s
listing   [  68% ] 52 VUs   1m21.7s/2m0s

running (1m52.0s), 210/210 VUs, 12634 complete and 0 interrupted iterations
crud      [  69% ] 158 VUs  1m22.7s/2m0s
listing   [  69% ] 52 VUs   1m22.7s/2m0s

running (1m53.0s), 210/210 VUs, 12665 complete and 0 interrupted iterations
crud      [  70% ] 158 VUs  1m23.7s/2m0s
listing   [  70% ] 52 VUs   1m23.7s/2m0s

running (1m54.0s), 210/210 VUs, 12697 complete and 0 interrupted iterations
crud      [  71% ] 158 VUs  1m24.7s/2m0s
listing   [  71% ] 52 VUs   1m24.7s/2m0s

running (1m55.0s), 210/210 VUs, 12718 complete and 0 interrupted iterations
crud      [  71% ] 158 VUs  1m25.7s/2m0s
listing   [  71% ] 52 VUs   1m25.7s/2m0s

running (1m56.0s), 210/210 VUs, 12735 complete and 0 interrupted iterations
crud      [  72% ] 158 VUs  1m26.7s/2m0s
listing   [  72% ] 52 VUs   1m26.7s/2m0s

running (1m57.0s), 210/210 VUs, 12746 complete and 0 interrupted iterations
crud      [  73% ] 158 VUs  1m27.7s/2m0s
listing   [  73% ] 52 VUs   1m27.7s/2m0s

running (1m58.0s), 210/210 VUs, 12766 complete and 0 interrupted iterations
crud      [  74% ] 158 VUs  1m28.7s/2m0s
listing   [  74% ] 52 VUs   1m28.7s/2m0s

running (1m59.0s), 210/210 VUs, 12795 complete and 0 interrupted iterations
crud      [  75% ] 158 VUs  1m29.7s/2m0s
listing   [  75% ] 52 VUs   1m29.7s/2m0s

running (2m00.0s), 210/210 VUs, 12820 complete and 0 interrupted iterations
crud      [  76% ] 158 VUs  1m30.7s/2m0s
listing   [  76% ] 52 VUs   1m30.7s/2m0s

running (2m01.0s), 210/210 VUs, 12851 complete and 0 interrupted iterations
crud      [  76% ] 158 VUs  1m31.7s/2m0s
listing   [  76% ] 52 VUs   1m31.7s/2m0s

running (2m02.0s), 210/210 VUs, 12873 complete and 0 interrupted iterations
crud      [  77% ] 158 VUs  1m32.7s/2m0s
listing   [  77% ] 52 VUs   1m32.7s/2m0s

running (2m03.0s), 210/210 VUs, 12894 complete and 0 interrupted iterations
crud      [  78% ] 158 VUs  1m33.7s/2m0s
listing   [  78% ] 52 VUs   1m33.7s/2m0s

running (2m04.0s), 210/210 VUs, 12918 complete and 0 interrupted iterations
crud      [  79% ] 158 VUs  1m34.7s/2m0s
listing   [  79% ] 52 VUs   1m34.7s/2m0s

running (2m05.0s), 210/210 VUs, 12932 complete and 0 interrupted iterations
crud      [  80% ] 158 VUs  1m35.7s/2m0s
listing   [  80% ] 52 VUs   1m35.7s/2m0s

running (2m06.0s), 210/210 VUs, 12966 complete and 0 interrupted iterations
crud      [  81% ] 158 VUs  1m36.7s/2m0s
listing   [  81% ] 52 VUs   1m36.7s/2m0s

running (2m07.0s), 210/210 VUs, 12981 complete and 0 interrupted iterations
crud      [  81% ] 158 VUs  1m37.7s/2m0s
listing   [  81% ] 52 VUs   1m37.7s/2m0s

running (2m08.0s), 210/210 VUs, 12992 complete and 0 interrupted iterations
crud      [  82% ] 158 VUs  1m38.7s/2m0s
listing   [  82% ] 52 VUs   1m38.7s/2m0s

running (2m09.0s), 210/210 VUs, 13008 complete and 0 interrupted iterations
crud      [  83% ] 158 VUs  1m39.7s/2m0s
listing   [  83% ] 52 VUs   1m39.7s/2m0s

running (2m10.0s), 210/210 VUs, 13031 complete and 0 interrupted iterations
crud      [  84% ] 158 VUs  1m40.7s/2m0s
listing   [  84% ] 52 VUs   1m40.7s/2m0s

running (2m11.0s), 210/210 VUs, 13058 complete and 0 interrupted iterations
crud      [  85% ] 158 VUs  1m41.7s/2m0s
listing   [  85% ] 52 VUs   1m41.7s/2m0s

running (2m12.0s), 210/210 VUs, 13078 complete and 0 interrupted iterations
crud      [  86% ] 158 VUs  1m42.7s/2m0s
listing   [  86% ] 52 VUs   1m42.7s/2m0s

running (2m13.0s), 210/210 VUs, 13101 complete and 0 interrupted iterations
crud      [  86% ] 158 VUs  1m43.7s/2m0s
listing   [  86% ] 52 VUs   1m43.7s/2m0s

running (2m14.0s), 210/210 VUs, 13118 complete and 0 interrupted iterations
crud      [  87% ] 158 VUs  1m44.7s/2m0s
listing   [  87% ] 52 VUs   1m44.7s/2m0s

running (2m15.0s), 210/210 VUs, 13129 complete and 0 interrupted iterations
crud      [  88% ] 158 VUs  1m45.7s/2m0s
listing   [  88% ] 52 VUs   1m45.7s/2m0s

running (2m16.0s), 210/210 VUs, 13150 complete and 0 interrupted iterations
crud      [  89% ] 158 VUs  1m46.7s/2m0s
listing   [  89% ] 52 VUs   1m46.7s/2m0s

running (2m17.0s), 210/210 VUs, 13172 complete and 0 interrupted iterations
crud      [  90% ] 158 VUs  1m47.7s/2m0s
listing   [  90% ] 52 VUs   1m47.7s/2m0s

running (2m18.0s), 210/210 VUs, 13190 complete and 0 interrupted iterations
crud      [  91% ] 158 VUs  1m48.7s/2m0s
listing   [  91% ] 52 VUs   1m48.7s/2m0s

running (2m19.0s), 210/210 VUs, 13208 complete and 0 interrupted iterations
crud      [  91% ] 158 VUs  1m49.7s/2m0s
listing   [  91% ] 52 VUs   1m49.7s/2m0s

running (2m20.0s), 210/210 VUs, 13215 complete and 0 interrupted iterations
crud      [  92% ] 158 VUs  1m50.7s/2m0s
listing   [  92% ] 52 VUs   1m50.7s/2m0s

running (2m21.0s), 210/210 VUs, 13222 complete and 0 interrupted iterations
crud      [  93% ] 158 VUs  1m51.7s/2m0s
listing   [  93% ] 52 VUs   1m51.7s/2m0s

running (2m22.0s), 210/210 VUs, 13234 complete and 0 interrupted iterations
crud      [  94% ] 158 VUs  1m52.7s/2m0s
listing   [  94% ] 52 VUs   1m52.7s/2m0s

running (2m23.0s), 210/210 VUs, 13253 complete and 0 interrupted iterations
crud      [  95% ] 158 VUs  1m53.7s/2m0s
listing   [  95% ] 52 VUs   1m53.7s/2m0s

running (2m24.0s), 210/210 VUs, 13276 complete and 0 interrupted iterations
crud      [  96% ] 158 VUs  1m54.7s/2m0s
listing   [  96% ] 52 VUs   1m54.7s/2m0s

running (2m25.0s), 210/210 VUs, 13305 complete and 0 interrupted iterations
crud      [  96% ] 158 VUs  1m55.7s/2m0s
listing   [  96% ] 52 VUs   1m55.7s/2m0s

running (2m26.0s), 210/210 VUs, 13320 complete and 0 interrupted iterations
crud      [  97% ] 158 VUs  1m56.7s/2m0s
listing   [  97% ] 52 VUs   1m56.7s/2m0s

running (2m27.0s), 210/210 VUs, 13327 complete and 0 interrupted iterations
crud      [  98% ] 158 VUs  1m57.7s/2m0s
listing   [  98% ] 52 VUs   1m57.7s/2m0s

running (2m28.0s), 210/210 VUs, 13344 complete and 0 interrupted iterations
crud      [  99% ] 158 VUs  1m58.7s/2m0s
listing   [  99% ] 52 VUs   1m58.7s/2m0s

running (2m29.0s), 210/210 VUs, 13366 complete and 0 interrupted iterations
crud      [ 100% ] 158 VUs  1m59.7s/2m0s
listing   [ 100% ] 52 VUs   1m59.7s/2m0s

running (2m30.0s), 195/210 VUs, 13385 complete and 0 interrupted iterations
crud    ↓ [ 100% ] 158 VUs  2m0s
listing ↓ [ 100% ] 52 VUs   2m0s

running (2m31.0s), 185/210 VUs, 13395 complete and 0 interrupted iterations
crud    ↓ [ 100% ] 158 VUs  2m0s
listing ↓ [ 100% ] 52 VUs   2m0s

running (2m32.0s), 177/210 VUs, 13403 complete and 0 interrupted iterations
crud    ↓ [ 100% ] 158 VUs  2m0s
listing ↓ [ 100% ] 52 VUs   2m0s

running (2m33.0s), 166/210 VUs, 13414 complete and 0 interrupted iterations
crud    ↓ [ 100% ] 158 VUs  2m0s
listing ↓ [ 100% ] 52 VUs   2m0s

running (2m34.0s), 153/210 VUs, 13427 complete and 0 interrupted iterations
crud    ↓ [ 100% ] 158 VUs  2m0s
listing ↓ [ 100% ] 52 VUs   2m0s

running (2m35.0s), 136/210 VUs, 13444 complete and 0 interrupted iterations
crud    ↓ [ 100% ] 158 VUs  2m0s
listing ↓ [ 100% ] 52 VUs   2m0s

running (2m36.0s), 132/210 VUs, 13448 complete and 0 interrupted iterations
crud    ↓ [ 100% ] 158 VUs  2m0s
listing ✓ [ 100% ] 52 VUs   2m0s

running (2m37.0s), 127/210 VUs, 13453 complete and 0 interrupted iterations
crud    ↓ [ 100% ] 158 VUs  2m0s
listing ✓ [ 100% ] 52 VUs   2m0s

running (2m38.0s), 121/210 VUs, 13459 complete and 0 interrupted iterations
crud    ↓ [ 100% ] 158 VUs  2m0s
listing ✓ [ 100% ] 52 VUs   2m0s

running (2m39.0s), 111/210 VUs, 13469 complete and 0 interrupted iterations
crud    ↓ [ 100% ] 158 VUs  2m0s
listing ✓ [ 100% ] 52 VUs   2m0s

running (2m40.0s), 096/210 VUs, 13484 complete and 0 interrupted iterations
crud    ↓ [ 100% ] 158 VUs  2m0s
listing ✓ [ 100% ] 52 VUs   2m0s

running (2m41.0s), 082/210 VUs, 13498 complete and 0 interrupted iterations
crud    ↓ [ 100% ] 158 VUs  2m0s
listing ✓ [ 100% ] 52 VUs   2m0s

running (2m42.0s), 066/210 VUs, 13514 complete and 0 interrupted iterations
crud    ↓ [ 100% ] 158 VUs  2m0s
listing ✓ [ 100% ] 52 VUs   2m0s

running (2m43.0s), 054/210 VUs, 13526 complete and 0 interrupted iterations
crud    ↓ [ 100% ] 158 VUs  2m0s
listing ✓ [ 100% ] 52 VUs   2m0s

running (2m44.0s), 046/210 VUs, 13534 complete and 0 interrupted iterations
crud    ↓ [ 100% ] 158 VUs  2m0s
listing ✓ [ 100% ] 52 VUs   2m0s

running (2m45.0s), 040/210 VUs, 13540 complete and 0 interrupted iterations
crud    ↓ [ 100% ] 158 VUs  2m0s
listing ✓ [ 100% ] 52 VUs   2m0s

running (2m46.0s), 032/210 VUs, 13548 complete and 0 interrupted iterations
crud    ↓ [ 100% ] 158 VUs  2m0s
listing ✓ [ 100% ] 52 VUs   2m0s

running (2m47.0s), 018/210 VUs, 13562 complete and 0 interrupted iterations
crud    ↓ [ 100% ] 158 VUs  2m0s
listing ✓ [ 100% ] 52 VUs   2m0s


  █ THRESHOLDS 

    http_req_duration
    ✗ 'p(95)<1000' p(95)=3.5s

      {scenario:crud}
      ✗ 'p(95)<1500' p(95)=3.75s

      {scenario:listing}
      ✗ 'p(95)<500' p(95)=3.44s

    http_req_failed
    ✓ 'rate<0.02' rate=0.00%


  █ TOTAL RESULTS 

    checks_total.......: 39332   234.68089/s
    checks_succeeded...: 100.00% 39332 out of 39332
    checks_failed......: 0.00%   0 out of 39332

    ✓ register 201
    ✓ login 200
    ✓ shelf created 201
    ✓ book added to shelf 201
    ✓ list 200
    ✓ create 201
    ✓ create retorna id e bookId
    ✓ get 200
    ✓ update 200
    ✓ delete 204

    HTTP
    http_req_duration..............: avg=360.7ms  min=3.72ms   med=19.03ms  max=13.19s p(90)=265.7ms  p(95)=3.5s 
      { expected_response:true }...: avg=360.7ms  min=3.72ms   med=19.03ms  max=13.19s p(90)=265.7ms  p(95)=3.5s 
      { scenario:crud }............: avg=394.23ms min=4.9ms    med=21.64ms  max=13.19s p(90)=446.7ms  p(95)=3.75s
      { scenario:listing }.........: avg=338.73ms min=4.02ms   med=10.62ms  max=8.98s  p(90)=426.21ms p(95)=3.44s
    http_req_failed................: 0.00% 0 out of 33354
    http_reqs......................: 33354 199.012164/s

    EXECUTION
    iteration_duration.............: avg=2s       min=504.38ms med=726.17ms max=26.41s p(90)=2.72s    p(95)=5.85s
    iterations.....................: 13580 81.027319/s
    vus............................: 18    min=0          max=210
    vus_max........................: 210   min=210        max=210

    NETWORK
    data_received..................: 17 MB 102 kB/s
    data_sent......................: 13 MB 80 kB/s




running (2m47.6s), 000/210 VUs, 13580 complete and 0 interrupted iterations
crud    ✓ [ 100% ] 158 VUs  2m0s
listing ✓ [ 100% ] 52 VUs   2m0s
time="2026-05-28T18:19:22-03:00" level=error msg="thresholds on metrics 'http_req_duration, http_req_duration{scenario:crud}, http_req_duration{scenario:listing}' have been crossed"

================================================================
% cd DomainFeed/review && k6 run review-spike.js
================================================================


         /\      Grafana   /‾‾/  
    /\  /  \     |\  __   /  /   
   /  \/    \    | |/ /  /   ‾‾\ 
  /          \   |   (  |  (‾)  |
 / __________ \  |_|\_\  \_____/ 


     execution: local
        script: review-spike.js
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


  █ THRESHOLDS 

    http_req_duration
    ✓ 'p(95)<1000' p(95)=521.84ms

    http_req_failed
    ✓ 'rate<0.05' rate=0.00%


  █ TOTAL RESULTS 

    checks_total.......: 869     2.896755/s
    checks_succeeded...: 100.00% 869 out of 869
    checks_failed......: 0.00%   0 out of 869

    ✓ register 201
    ✓ login 200
    ✓ shelf created 201
    ✓ book added 201

    HTTP
    http_req_duration..............: avg=344.82ms min=55.37ms med=338.13ms max=1.04s p(90)=488.76ms p(95)=521.84ms
      { expected_response:true }...: avg=344.82ms min=55.37ms med=338.13ms max=1.04s p(90)=488.76ms p(95)=521.84ms
    http_req_failed................: 0.00%  0 out of 869
    http_reqs......................: 869    2.896755/s

    EXECUTION
    vus............................: 0      min=0        max=0  
    vus_max........................: 500    min=500      max=500

    NETWORK
    data_received..................: 621 kB 2.1 kB/s
    data_sent......................: 390 kB 1.3 kB/s




Run       [ 100% ] setup()
default   [   0% ]
time="2026-05-28T18:24:22-03:00" level=error msg="setup() execution timed out after 300 seconds" hint="You can increase the time limit via the setupTimeout option"

================================================================
% cd DomainFeed/review && k6 run review-stress.js
================================================================


         /\      Grafana   /‾‾/  
    /\  /  \     |\  __   /  /   
   /  \/    \    | |/ /  /   ‾‾\ 
  /          \   |   (  |  (‾)  |
 / __________ \  |_|\_\  \_____/ 


     execution: local
        script: review-stress.js
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


  █ THRESHOLDS 

    http_req_duration
    ✗ 'p(95)<1000' p(95)=1.13s

    http_req_failed
    ✓ 'rate<0.05' rate=0.00%


  █ TOTAL RESULTS 

    checks_total.......: 901     1.501719/s
    checks_succeeded...: 100.00% 901 out of 901
    checks_failed......: 0.00%   0 out of 901

    ✓ register 201
    ✓ login 200
    ✓ shelf created 201
    ✓ book added 201

    HTTP
    http_req_duration..............: avg=664.68ms min=171.89ms med=620.49ms max=2.53s p(90)=968.38ms p(95)=1.13s
      { expected_response:true }...: avg=664.68ms min=171.89ms med=620.49ms max=2.53s p(90)=968.38ms p(95)=1.13s
    http_req_failed................: 0.00%  0 out of 901
    http_reqs......................: 901    1.501719/s

    EXECUTION
    vus............................: 0      min=0        max=0  
    vus_max........................: 600    min=600      max=600

    NETWORK
    data_received..................: 645 kB 1.1 kB/s
    data_sent......................: 406 kB 677 B/s




Run       [ 100% ] setup()
default   [   0% ]
time="2026-05-28T18:34:23-03:00" level=error msg="setup() execution timed out after 600 seconds" hint="You can increase the time limit via the setupTimeout option"
