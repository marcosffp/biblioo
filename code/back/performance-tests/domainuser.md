================================================================
% cd DomainUser/user && k6 run user-load.js
================================================================


         /\      Grafana   /‾‾/  
    /\  /  \     |\  __   /  /   
   /  \/    \    | |/ /  /   ‾‾\ 
  /          \   |   (  |  (‾)  |
 / __________ \  |_|\_\  \_____/ 


     execution: local
        script: user-load.js
        output: -

     scenarios: (100.00%) 2 scenarios, 210 max VUs, 2m30s max duration (incl. graceful stop):
              * auth: 84 looping VUs for 2m0s (exec: authFlow, gracefulStop: 30s)
              * profile: 126 looping VUs for 2m0s (exec: profileRead, gracefulStop: 30s)


Run       [ 100% ] setup()
auth      [   0% ]
profile   [   0% ]

Run       [ 100% ] setup()
auth      [   0% ]
profile   [   0% ]

Run       [ 100% ] setup()
auth      [   0% ]
profile   [   0% ]

Run       [ 100% ] setup()
auth      [   0% ]
profile   [   0% ]

Run       [ 100% ] setup()
auth      [   0% ]
profile   [   0% ]

Run       [ 100% ] setup()
auth      [   0% ]
profile   [   0% ]

Run       [ 100% ] setup()
auth      [   0% ]
profile   [   0% ]

Run       [ 100% ] setup()
auth      [   0% ]
profile   [   0% ]

Run       [ 100% ] setup()
auth      [   0% ]
profile   [   0% ]

Run       [ 100% ] setup()
auth      [   0% ]
profile   [   0% ]

Run       [ 100% ] setup()
auth      [   0% ]
profile   [   0% ]

running (0m12.0s), 210/210 VUs, 0 complete and 0 interrupted iterations
auth      [   0% ] 84 VUs   0m00.1s/2m0s
profile   [   0% ] 126 VUs  0m00.1s/2m0s

running (0m13.0s), 210/210 VUs, 53 complete and 0 interrupted iterations
auth      [   1% ] 84 VUs   0m01.1s/2m0s
profile   [   1% ] 126 VUs  0m01.1s/2m0s

running (0m14.0s), 210/210 VUs, 336 complete and 0 interrupted iterations
auth      [   2% ] 84 VUs   0m02.1s/2m0s
profile   [   2% ] 126 VUs  0m02.1s/2m0s

running (0m15.0s), 210/210 VUs, 522 complete and 0 interrupted iterations
auth      [   3% ] 84 VUs   0m03.1s/2m0s
profile   [   3% ] 126 VUs  0m03.1s/2m0s

running (0m16.0s), 210/210 VUs, 672 complete and 0 interrupted iterations
auth      [   3% ] 84 VUs   0m04.1s/2m0s
profile   [   3% ] 126 VUs  0m04.1s/2m0s

running (0m17.0s), 210/210 VUs, 899 complete and 0 interrupted iterations
auth      [   4% ] 84 VUs   0m05.1s/2m0s
profile   [   4% ] 126 VUs  0m05.1s/2m0s

running (0m18.0s), 210/210 VUs, 1165 complete and 0 interrupted iterations
auth      [   5% ] 84 VUs   0m06.1s/2m0s
profile   [   5% ] 126 VUs  0m06.1s/2m0s

running (0m19.0s), 210/210 VUs, 1354 complete and 0 interrupted iterations
auth      [   6% ] 84 VUs   0m07.1s/2m0s
profile   [   6% ] 126 VUs  0m07.1s/2m0s

running (0m20.0s), 210/210 VUs, 1554 complete and 0 interrupted iterations
auth      [   7% ] 84 VUs   0m08.1s/2m0s
profile   [   7% ] 126 VUs  0m08.1s/2m0s

running (0m21.0s), 210/210 VUs, 1764 complete and 0 interrupted iterations
auth      [   8% ] 84 VUs   0m09.1s/2m0s
profile   [   8% ] 126 VUs  0m09.1s/2m0s

running (0m22.0s), 210/210 VUs, 1936 complete and 0 interrupted iterations
auth      [   8% ] 84 VUs   0m10.1s/2m0s
profile   [   8% ] 126 VUs  0m10.1s/2m0s

running (0m23.0s), 210/210 VUs, 2179 complete and 0 interrupted iterations
auth      [   9% ] 84 VUs   0m11.1s/2m0s
profile   [   9% ] 126 VUs  0m11.1s/2m0s

running (0m24.0s), 210/210 VUs, 2436 complete and 0 interrupted iterations
auth      [  10% ] 84 VUs   0m12.1s/2m0s
profile   [  10% ] 126 VUs  0m12.1s/2m0s

running (0m25.0s), 210/210 VUs, 2620 complete and 0 interrupted iterations
auth      [  11% ] 84 VUs   0m13.1s/2m0s
profile   [  11% ] 126 VUs  0m13.1s/2m0s

running (0m26.0s), 210/210 VUs, 2785 complete and 0 interrupted iterations
auth      [  12% ] 84 VUs   0m14.1s/2m0s
profile   [  12% ] 126 VUs  0m14.1s/2m0s

running (0m27.0s), 210/210 VUs, 3008 complete and 0 interrupted iterations
auth      [  13% ] 84 VUs   0m15.1s/2m0s
profile   [  13% ] 126 VUs  0m15.1s/2m0s

running (0m28.0s), 210/210 VUs, 3311 complete and 0 interrupted iterations
auth      [  13% ] 84 VUs   0m16.1s/2m0s
profile   [  13% ] 126 VUs  0m16.1s/2m0s

running (0m29.0s), 210/210 VUs, 3472 complete and 0 interrupted iterations
auth      [  14% ] 84 VUs   0m17.1s/2m0s
profile   [  14% ] 126 VUs  0m17.1s/2m0s

running (0m30.0s), 210/210 VUs, 3662 complete and 0 interrupted iterations
auth      [  15% ] 84 VUs   0m18.1s/2m0s
profile   [  15% ] 126 VUs  0m18.1s/2m0s

running (0m31.0s), 210/210 VUs, 3867 complete and 0 interrupted iterations
auth      [  16% ] 84 VUs   0m19.1s/2m0s
profile   [  16% ] 126 VUs  0m19.1s/2m0s

running (0m32.0s), 210/210 VUs, 4064 complete and 0 interrupted iterations
auth      [  17% ] 84 VUs   0m20.1s/2m0s
profile   [  17% ] 126 VUs  0m20.1s/2m0s

running (0m33.0s), 210/210 VUs, 4316 complete and 0 interrupted iterations
auth      [  18% ] 84 VUs   0m21.1s/2m0s
profile   [  18% ] 126 VUs  0m21.1s/2m0s

running (0m34.0s), 210/210 VUs, 4540 complete and 0 interrupted iterations
auth      [  18% ] 84 VUs   0m22.1s/2m0s
profile   [  18% ] 126 VUs  0m22.1s/2m0s

running (0m35.0s), 210/210 VUs, 4734 complete and 0 interrupted iterations
auth      [  19% ] 84 VUs   0m23.1s/2m0s
profile   [  19% ] 126 VUs  0m23.1s/2m0s

running (0m36.0s), 210/210 VUs, 4938 complete and 0 interrupted iterations
auth      [  20% ] 84 VUs   0m24.1s/2m0s
profile   [  20% ] 126 VUs  0m24.1s/2m0s

running (0m37.0s), 210/210 VUs, 5152 complete and 0 interrupted iterations
auth      [  21% ] 84 VUs   0m25.1s/2m0s
profile   [  21% ] 126 VUs  0m25.1s/2m0s

running (0m38.0s), 210/210 VUs, 5419 complete and 0 interrupted iterations
auth      [  22% ] 84 VUs   0m26.1s/2m0s
profile   [  22% ] 126 VUs  0m26.1s/2m0s

running (0m39.0s), 210/210 VUs, 5603 complete and 0 interrupted iterations
auth      [  23% ] 84 VUs   0m27.1s/2m0s
profile   [  23% ] 126 VUs  0m27.1s/2m0s

running (0m40.0s), 210/210 VUs, 5791 complete and 0 interrupted iterations
auth      [  23% ] 84 VUs   0m28.1s/2m0s
profile   [  23% ] 126 VUs  0m28.1s/2m0s

running (0m41.0s), 210/210 VUs, 6008 complete and 0 interrupted iterations
auth      [  24% ] 84 VUs   0m29.1s/2m0s
profile   [  24% ] 126 VUs  0m29.1s/2m0s

running (0m42.0s), 210/210 VUs, 6244 complete and 0 interrupted iterations
auth      [  25% ] 84 VUs   0m30.1s/2m0s
profile   [  25% ] 126 VUs  0m30.1s/2m0s

running (0m43.0s), 210/210 VUs, 6473 complete and 0 interrupted iterations
auth      [  26% ] 84 VUs   0m31.1s/2m0s
profile   [  26% ] 126 VUs  0m31.1s/2m0s

running (0m44.0s), 210/210 VUs, 6665 complete and 0 interrupted iterations
auth      [  27% ] 84 VUs   0m32.1s/2m0s
profile   [  27% ] 126 VUs  0m32.1s/2m0s

running (0m45.0s), 210/210 VUs, 6876 complete and 0 interrupted iterations
auth      [  28% ] 84 VUs   0m33.1s/2m0s
profile   [  28% ] 126 VUs  0m33.1s/2m0s

running (0m46.0s), 210/210 VUs, 7102 complete and 0 interrupted iterations
auth      [  28% ] 84 VUs   0m34.1s/2m0s
profile   [  28% ] 126 VUs  0m34.1s/2m0s

running (0m47.0s), 210/210 VUs, 7329 complete and 0 interrupted iterations
auth      [  29% ] 84 VUs   0m35.1s/2m0s
profile   [  29% ] 126 VUs  0m35.1s/2m0s

running (0m48.0s), 210/210 VUs, 7539 complete and 0 interrupted iterations
auth      [  30% ] 84 VUs   0m36.1s/2m0s
profile   [  30% ] 126 VUs  0m36.1s/2m0s

running (0m49.0s), 210/210 VUs, 7725 complete and 0 interrupted iterations
auth      [  31% ] 84 VUs   0m37.1s/2m0s
profile   [  31% ] 126 VUs  0m37.1s/2m0s

running (0m50.0s), 210/210 VUs, 7946 complete and 0 interrupted iterations
auth      [  32% ] 84 VUs   0m38.1s/2m0s
profile   [  32% ] 126 VUs  0m38.1s/2m0s

running (0m51.0s), 210/210 VUs, 8179 complete and 0 interrupted iterations
auth      [  33% ] 84 VUs   0m39.1s/2m0s
profile   [  33% ] 126 VUs  0m39.1s/2m0s

running (0m52.0s), 210/210 VUs, 8420 complete and 0 interrupted iterations
auth      [  33% ] 84 VUs   0m40.1s/2m0s
profile   [  33% ] 126 VUs  0m40.1s/2m0s

running (0m53.0s), 210/210 VUs, 8596 complete and 0 interrupted iterations
auth      [  34% ] 84 VUs   0m41.1s/2m0s
profile   [  34% ] 126 VUs  0m41.1s/2m0s

running (0m54.0s), 210/210 VUs, 8796 complete and 0 interrupted iterations
auth      [  35% ] 84 VUs   0m42.1s/2m0s
profile   [  35% ] 126 VUs  0m42.1s/2m0s

running (0m55.0s), 210/210 VUs, 9004 complete and 0 interrupted iterations
auth      [  36% ] 84 VUs   0m43.1s/2m0s
profile   [  36% ] 126 VUs  0m43.1s/2m0s

running (0m56.0s), 210/210 VUs, 9245 complete and 0 interrupted iterations
auth      [  37% ] 84 VUs   0m44.1s/2m0s
profile   [  37% ] 126 VUs  0m44.1s/2m0s

running (0m57.0s), 210/210 VUs, 9468 complete and 0 interrupted iterations
auth      [  38% ] 84 VUs   0m45.1s/2m0s
profile   [  38% ] 126 VUs  0m45.1s/2m0s

running (0m58.0s), 210/210 VUs, 9653 complete and 0 interrupted iterations
auth      [  38% ] 84 VUs   0m46.1s/2m0s
profile   [  38% ] 126 VUs  0m46.1s/2m0s

running (0m59.0s), 210/210 VUs, 9867 complete and 0 interrupted iterations
auth      [  39% ] 84 VUs   0m47.1s/2m0s
profile   [  39% ] 126 VUs  0m47.1s/2m0s

running (1m00.0s), 210/210 VUs, 10086 complete and 0 interrupted iterations
auth      [  40% ] 84 VUs   0m48.1s/2m0s
profile   [  40% ] 126 VUs  0m48.1s/2m0s

running (1m01.0s), 210/210 VUs, 10317 complete and 0 interrupted iterations
auth      [  41% ] 84 VUs   0m49.1s/2m0s
profile   [  41% ] 126 VUs  0m49.1s/2m0s

running (1m02.0s), 210/210 VUs, 10525 complete and 0 interrupted iterations
auth      [  42% ] 84 VUs   0m50.1s/2m0s
profile   [  42% ] 126 VUs  0m50.1s/2m0s

running (1m03.0s), 210/210 VUs, 10727 complete and 0 interrupted iterations
auth      [  43% ] 84 VUs   0m51.1s/2m0s
profile   [  43% ] 126 VUs  0m51.1s/2m0s

running (1m04.0s), 210/210 VUs, 10932 complete and 0 interrupted iterations
auth      [  43% ] 84 VUs   0m52.1s/2m0s
profile   [  43% ] 126 VUs  0m52.1s/2m0s

running (1m05.0s), 210/210 VUs, 11184 complete and 0 interrupted iterations
auth      [  44% ] 84 VUs   0m53.1s/2m0s
profile   [  44% ] 126 VUs  0m53.1s/2m0s

running (1m06.0s), 210/210 VUs, 11398 complete and 0 interrupted iterations
auth      [  45% ] 84 VUs   0m54.1s/2m0s
profile   [  45% ] 126 VUs  0m54.1s/2m0s

running (1m07.0s), 210/210 VUs, 11600 complete and 0 interrupted iterations
auth      [  46% ] 84 VUs   0m55.1s/2m0s
profile   [  46% ] 126 VUs  0m55.1s/2m0s

running (1m08.0s), 210/210 VUs, 11806 complete and 0 interrupted iterations
auth      [  47% ] 84 VUs   0m56.1s/2m0s
profile   [  47% ] 126 VUs  0m56.1s/2m0s

running (1m09.0s), 210/210 VUs, 12021 complete and 0 interrupted iterations
auth      [  48% ] 84 VUs   0m57.1s/2m0s
profile   [  48% ] 126 VUs  0m57.1s/2m0s

running (1m10.0s), 210/210 VUs, 12253 complete and 0 interrupted iterations
auth      [  48% ] 84 VUs   0m58.1s/2m0s
profile   [  48% ] 126 VUs  0m58.1s/2m0s

running (1m11.0s), 210/210 VUs, 12465 complete and 0 interrupted iterations
auth      [  49% ] 84 VUs   0m59.1s/2m0s
profile   [  49% ] 126 VUs  0m59.1s/2m0s

running (1m12.0s), 210/210 VUs, 12668 complete and 0 interrupted iterations
auth      [  50% ] 84 VUs   1m00.1s/2m0s
profile   [  50% ] 126 VUs  1m00.1s/2m0s

running (1m13.0s), 210/210 VUs, 12868 complete and 0 interrupted iterations
auth      [  51% ] 84 VUs   1m01.1s/2m0s
profile   [  51% ] 126 VUs  1m01.1s/2m0s

running (1m14.0s), 210/210 VUs, 13092 complete and 0 interrupted iterations
auth      [  52% ] 84 VUs   1m02.1s/2m0s
profile   [  52% ] 126 VUs  1m02.1s/2m0s

running (1m15.0s), 210/210 VUs, 13333 complete and 0 interrupted iterations
auth      [  53% ] 84 VUs   1m03.1s/2m0s
profile   [  53% ] 126 VUs  1m03.1s/2m0s

running (1m16.0s), 210/210 VUs, 13541 complete and 0 interrupted iterations
auth      [  53% ] 84 VUs   1m04.1s/2m0s
profile   [  53% ] 126 VUs  1m04.1s/2m0s

running (1m17.0s), 210/210 VUs, 13730 complete and 0 interrupted iterations
auth      [  54% ] 84 VUs   1m05.1s/2m0s
profile   [  54% ] 126 VUs  1m05.1s/2m0s

running (1m18.0s), 210/210 VUs, 13957 complete and 0 interrupted iterations
auth      [  55% ] 84 VUs   1m06.1s/2m0s
profile   [  55% ] 126 VUs  1m06.1s/2m0s

running (1m19.0s), 210/210 VUs, 14183 complete and 0 interrupted iterations
auth      [  56% ] 84 VUs   1m07.1s/2m0s
profile   [  56% ] 126 VUs  1m07.1s/2m0s

running (1m20.0s), 210/210 VUs, 14400 complete and 0 interrupted iterations
auth      [  57% ] 84 VUs   1m08.1s/2m0s
profile   [  57% ] 126 VUs  1m08.1s/2m0s

running (1m21.0s), 210/210 VUs, 14597 complete and 0 interrupted iterations
auth      [  58% ] 84 VUs   1m09.1s/2m0s
profile   [  58% ] 126 VUs  1m09.1s/2m0s

running (1m22.0s), 210/210 VUs, 14810 complete and 0 interrupted iterations
auth      [  58% ] 84 VUs   1m10.1s/2m0s
profile   [  58% ] 126 VUs  1m10.1s/2m0s

running (1m23.0s), 210/210 VUs, 15033 complete and 0 interrupted iterations
auth      [  59% ] 84 VUs   1m11.1s/2m0s
profile   [  59% ] 126 VUs  1m11.1s/2m0s

running (1m24.0s), 210/210 VUs, 15268 complete and 0 interrupted iterations
auth      [  60% ] 84 VUs   1m12.1s/2m0s
profile   [  60% ] 126 VUs  1m12.1s/2m0s

running (1m25.0s), 210/210 VUs, 15478 complete and 0 interrupted iterations
auth      [  61% ] 84 VUs   1m13.1s/2m0s
profile   [  61% ] 126 VUs  1m13.1s/2m0s

running (1m26.0s), 210/210 VUs, 15665 complete and 0 interrupted iterations
auth      [  62% ] 84 VUs   1m14.1s/2m0s
profile   [  62% ] 126 VUs  1m14.1s/2m0s

running (1m27.0s), 210/210 VUs, 15879 complete and 0 interrupted iterations
auth      [  63% ] 84 VUs   1m15.1s/2m0s
profile   [  63% ] 126 VUs  1m15.1s/2m0s

running (1m28.0s), 210/210 VUs, 16086 complete and 0 interrupted iterations
auth      [  63% ] 84 VUs   1m16.1s/2m0s
profile   [  63% ] 126 VUs  1m16.1s/2m0s

running (1m29.0s), 210/210 VUs, 16342 complete and 0 interrupted iterations
auth      [  64% ] 84 VUs   1m17.1s/2m0s
profile   [  64% ] 126 VUs  1m17.1s/2m0s

running (1m30.0s), 210/210 VUs, 16528 complete and 0 interrupted iterations
auth      [  65% ] 84 VUs   1m18.1s/2m0s
profile   [  65% ] 126 VUs  1m18.1s/2m0s

running (1m31.0s), 210/210 VUs, 16746 complete and 0 interrupted iterations
auth      [  66% ] 84 VUs   1m19.1s/2m0s
profile   [  66% ] 126 VUs  1m19.1s/2m0s

running (1m32.0s), 210/210 VUs, 16962 complete and 0 interrupted iterations
auth      [  67% ] 84 VUs   1m20.1s/2m0s
profile   [  67% ] 126 VUs  1m20.1s/2m0s

running (1m33.0s), 210/210 VUs, 17158 complete and 0 interrupted iterations
auth      [  68% ] 84 VUs   1m21.1s/2m0s
profile   [  68% ] 126 VUs  1m21.1s/2m0s

running (1m34.0s), 210/210 VUs, 17398 complete and 0 interrupted iterations
auth      [  68% ] 84 VUs   1m22.1s/2m0s
profile   [  68% ] 126 VUs  1m22.1s/2m0s

running (1m35.0s), 210/210 VUs, 17600 complete and 0 interrupted iterations
auth      [  69% ] 84 VUs   1m23.1s/2m0s
profile   [  69% ] 126 VUs  1m23.1s/2m0s

running (1m36.0s), 210/210 VUs, 17807 complete and 0 interrupted iterations
auth      [  70% ] 84 VUs   1m24.1s/2m0s
profile   [  70% ] 126 VUs  1m24.1s/2m0s

running (1m37.0s), 210/210 VUs, 18024 complete and 0 interrupted iterations
auth      [  71% ] 84 VUs   1m25.1s/2m0s
profile   [  71% ] 126 VUs  1m25.1s/2m0s

running (1m38.0s), 210/210 VUs, 18253 complete and 0 interrupted iterations
auth      [  72% ] 84 VUs   1m26.1s/2m0s
profile   [  72% ] 126 VUs  1m26.1s/2m0s

running (1m39.0s), 210/210 VUs, 18468 complete and 0 interrupted iterations
auth      [  73% ] 84 VUs   1m27.1s/2m0s
profile   [  73% ] 126 VUs  1m27.1s/2m0s

running (1m40.0s), 210/210 VUs, 18671 complete and 0 interrupted iterations
auth      [  73% ] 84 VUs   1m28.1s/2m0s
profile   [  73% ] 126 VUs  1m28.1s/2m0s

running (1m41.0s), 210/210 VUs, 18886 complete and 0 interrupted iterations
auth      [  74% ] 84 VUs   1m29.1s/2m0s
profile   [  74% ] 126 VUs  1m29.1s/2m0s

running (1m42.0s), 210/210 VUs, 19092 complete and 0 interrupted iterations
auth      [  75% ] 84 VUs   1m30.1s/2m0s
profile   [  75% ] 126 VUs  1m30.1s/2m0s

running (1m43.0s), 210/210 VUs, 19314 complete and 0 interrupted iterations
auth      [  76% ] 84 VUs   1m31.1s/2m0s
profile   [  76% ] 126 VUs  1m31.1s/2m0s

running (1m44.0s), 210/210 VUs, 19527 complete and 0 interrupted iterations
auth      [  77% ] 84 VUs   1m32.1s/2m0s
profile   [  77% ] 126 VUs  1m32.1s/2m0s

running (1m45.0s), 210/210 VUs, 19713 complete and 0 interrupted iterations
auth      [  78% ] 84 VUs   1m33.1s/2m0s
profile   [  78% ] 126 VUs  1m33.1s/2m0s

running (1m46.0s), 210/210 VUs, 19961 complete and 0 interrupted iterations
auth      [  78% ] 84 VUs   1m34.1s/2m0s
profile   [  78% ] 126 VUs  1m34.1s/2m0s

running (1m47.0s), 210/210 VUs, 20178 complete and 0 interrupted iterations
auth      [  79% ] 84 VUs   1m35.1s/2m0s
profile   [  79% ] 126 VUs  1m35.1s/2m0s

running (1m48.0s), 210/210 VUs, 20403 complete and 0 interrupted iterations
auth      [  80% ] 84 VUs   1m36.1s/2m0s
profile   [  80% ] 126 VUs  1m36.1s/2m0s

running (1m49.0s), 210/210 VUs, 20587 complete and 0 interrupted iterations
auth      [  81% ] 84 VUs   1m37.1s/2m0s
profile   [  81% ] 126 VUs  1m37.1s/2m0s

running (1m50.0s), 210/210 VUs, 20828 complete and 0 interrupted iterations
auth      [  82% ] 84 VUs   1m38.1s/2m0s
profile   [  82% ] 126 VUs  1m38.1s/2m0s

running (1m51.0s), 210/210 VUs, 21030 complete and 0 interrupted iterations
auth      [  83% ] 84 VUs   1m39.1s/2m0s
profile   [  83% ] 126 VUs  1m39.1s/2m0s

running (1m52.0s), 210/210 VUs, 21238 complete and 0 interrupted iterations
auth      [  83% ] 84 VUs   1m40.1s/2m0s
profile   [  83% ] 126 VUs  1m40.1s/2m0s

running (1m53.0s), 210/210 VUs, 21452 complete and 0 interrupted iterations
auth      [  84% ] 84 VUs   1m41.1s/2m0s
profile   [  84% ] 126 VUs  1m41.1s/2m0s

running (1m54.0s), 210/210 VUs, 21657 complete and 0 interrupted iterations
auth      [  85% ] 84 VUs   1m42.1s/2m0s
profile   [  85% ] 126 VUs  1m42.1s/2m0s

running (1m55.0s), 210/210 VUs, 21894 complete and 0 interrupted iterations
auth      [  86% ] 84 VUs   1m43.1s/2m0s
profile   [  86% ] 126 VUs  1m43.1s/2m0s

running (1m56.0s), 210/210 VUs, 22097 complete and 0 interrupted iterations
auth      [  87% ] 84 VUs   1m44.1s/2m0s
profile   [  87% ] 126 VUs  1m44.1s/2m0s

running (1m57.0s), 210/210 VUs, 22329 complete and 0 interrupted iterations
auth      [  88% ] 84 VUs   1m45.1s/2m0s
profile   [  88% ] 126 VUs  1m45.1s/2m0s

running (1m58.0s), 210/210 VUs, 22520 complete and 0 interrupted iterations
auth      [  88% ] 84 VUs   1m46.1s/2m0s
profile   [  88% ] 126 VUs  1m46.1s/2m0s

running (1m59.0s), 210/210 VUs, 22762 complete and 0 interrupted iterations
auth      [  89% ] 84 VUs   1m47.1s/2m0s
profile   [  89% ] 126 VUs  1m47.1s/2m0s

running (2m00.0s), 210/210 VUs, 22966 complete and 0 interrupted iterations
auth      [  90% ] 84 VUs   1m48.1s/2m0s
profile   [  90% ] 126 VUs  1m48.1s/2m0s

running (2m01.0s), 210/210 VUs, 23175 complete and 0 interrupted iterations
auth      [  91% ] 84 VUs   1m49.1s/2m0s
profile   [  91% ] 126 VUs  1m49.1s/2m0s

running (2m02.0s), 210/210 VUs, 23394 complete and 0 interrupted iterations
auth      [  92% ] 84 VUs   1m50.1s/2m0s
profile   [  92% ] 126 VUs  1m50.1s/2m0s

running (2m03.0s), 210/210 VUs, 23613 complete and 0 interrupted iterations
auth      [  93% ] 84 VUs   1m51.1s/2m0s
profile   [  93% ] 126 VUs  1m51.1s/2m0s

running (2m04.0s), 210/210 VUs, 23808 complete and 0 interrupted iterations
auth      [  93% ] 84 VUs   1m52.1s/2m0s
profile   [  93% ] 126 VUs  1m52.1s/2m0s

running (2m05.0s), 210/210 VUs, 24042 complete and 0 interrupted iterations
auth      [  94% ] 84 VUs   1m53.1s/2m0s
profile   [  94% ] 126 VUs  1m53.1s/2m0s

running (2m06.0s), 210/210 VUs, 24260 complete and 0 interrupted iterations
auth      [  95% ] 84 VUs   1m54.1s/2m0s
profile   [  95% ] 126 VUs  1m54.1s/2m0s

running (2m07.0s), 210/210 VUs, 24462 complete and 0 interrupted iterations
auth      [  96% ] 84 VUs   1m55.1s/2m0s
profile   [  96% ] 126 VUs  1m55.1s/2m0s

running (2m08.0s), 210/210 VUs, 24668 complete and 0 interrupted iterations
auth      [  97% ] 84 VUs   1m56.1s/2m0s
profile   [  97% ] 126 VUs  1m56.1s/2m0s

running (2m09.0s), 210/210 VUs, 24901 complete and 0 interrupted iterations
auth      [  98% ] 84 VUs   1m57.1s/2m0s
profile   [  98% ] 126 VUs  1m57.1s/2m0s

running (2m10.0s), 210/210 VUs, 25116 complete and 0 interrupted iterations
auth      [  98% ] 84 VUs   1m58.1s/2m0s
profile   [  98% ] 126 VUs  1m58.1s/2m0s

running (2m11.0s), 210/210 VUs, 25311 complete and 0 interrupted iterations
auth      [  99% ] 84 VUs   1m59.1s/2m0s
profile   [  99% ] 126 VUs  1m59.1s/2m0s

running (2m12.0s), 170/210 VUs, 25540 complete and 0 interrupted iterations
auth    ↓ [ 100% ] 84 VUs   2m0s
profile ↓ [ 100% ] 126 VUs  2m0s

running (2m13.0s), 004/210 VUs, 25706 complete and 0 interrupted iterations
auth    ↓ [ 100% ] 84 VUs   2m0s
profile ✓ [ 100% ] 126 VUs  2m0s


  █ THRESHOLDS 

    http_req_duration
    ✓ 'p(95)<1000' p(95)=58.77ms

      {scenario:auth}
      ✓ 'p(95)<2000' p(95)=79.23ms

      {scenario:profile}
      ✓ 'p(95)<500' p(95)=34.85ms

    http_req_failed
    ✓ 'rate<0.01' rate=0.00%


  █ TOTAL RESULTS 

    checks_total.......: 59186   444.873943/s
    checks_succeeded...: 100.00% 59186 out of 59186
    checks_failed......: 0.00%   0 out of 59186

    ✓ register 201
    ✓ login 200
    ✓ GET /me 200
    ✓ GET /{username} 200
    ✓ login retorna token

    HTTP
    http_req_duration..............: avg=20.33ms  min=1.79ms   med=9.33ms   max=725.47ms p(90)=45.46ms p(95)=58.77ms
      { expected_response:true }...: avg=20.33ms  min=1.79ms   med=9.33ms   max=725.47ms p(90)=45.46ms p(95)=58.77ms
      { scenario:auth }............: avg=42.42ms  min=20.93ms  med=34.47ms  max=460.97ms p(90)=65.82ms p(95)=79.23ms
      { scenario:profile }.........: avg=11.49ms  min=1.79ms   med=6.22ms   max=725.47ms p(90)=24.51ms p(95)=34.85ms
    http_req_failed................: 0.00% 0 out of 51880
    http_reqs......................: 51880 389.958101/s

    EXECUTION
    iteration_duration.............: avg=983.96ms min=804.12ms med=824.28ms max=1.79s    p(90)=1.38s   p(95)=1.41s  
    iterations.....................: 25710 193.250246/s
    vus............................: 4     min=0          max=210
    vus_max........................: 210   min=210        max=210

    NETWORK
    data_received..................: 36 MB 273 kB/s
    data_sent......................: 17 MB 127 kB/s




running (2m13.0s), 000/210 VUs, 25710 complete and 0 interrupted iterations
auth    ✓ [ 100% ] 84 VUs   2m0s
profile ✓ [ 100% ] 126 VUs  2m0s

================================================================
% cd DomainUser/user && k6 run user-spike.js
================================================================


         /\      Grafana   /‾‾/  
    /\  /  \     |\  __   /  /   
   /  \/    \    | |/ /  /   ‾‾\ 
  /          \   |   (  |  (‾)  |
 / __________ \  |_|\_\  \_____/ 


     execution: local
        script: user-spike.js
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

running (0m25.0s), 004/500 VUs, 0 complete and 0 interrupted iterations
default   [   1% ] 004/500 VUs  00.5s/50.0s

running (0m26.0s), 011/500 VUs, 5 complete and 0 interrupted iterations
default   [   3% ] 011/500 VUs  01.5s/50.0s

running (0m27.0s), 018/500 VUs, 20 complete and 0 interrupted iterations
default   [   5% ] 018/500 VUs  02.5s/50.0s

running (0m28.0s), 025/500 VUs, 42 complete and 0 interrupted iterations
default   [   7% ] 025/500 VUs  03.5s/50.0s

running (0m29.0s), 032/500 VUs, 73 complete and 0 interrupted iterations
default   [   9% ] 032/500 VUs  04.5s/50.0s

running (0m30.0s), 039/500 VUs, 112 complete and 0 interrupted iterations
default   [  11% ] 039/500 VUs  05.5s/50.0s

running (0m31.0s), 046/500 VUs, 159 complete and 0 interrupted iterations
default   [  13% ] 046/500 VUs  06.5s/50.0s

running (0m32.0s), 053/500 VUs, 216 complete and 0 interrupted iterations
default   [  15% ] 053/500 VUs  07.5s/50.0s

running (0m33.0s), 059/500 VUs, 284 complete and 0 interrupted iterations
default   [  17% ] 059/500 VUs  08.5s/50.0s

running (0m34.0s), 066/500 VUs, 356 complete and 0 interrupted iterations
default   [  19% ] 066/500 VUs  09.5s/50.0s

running (0m35.0s), 116/500 VUs, 435 complete and 0 interrupted iterations
default   [  21% ] 116/500 VUs  10.5s/50.0s

running (0m36.0s), 202/500 VUs, 587 complete and 0 interrupted iterations
default   [  23% ] 202/500 VUs  11.5s/50.0s

running (0m37.0s), 288/500 VUs, 846 complete and 0 interrupted iterations
default   [  25% ] 288/500 VUs  12.5s/50.0s

running (0m38.0s), 374/500 VUs, 1218 complete and 0 interrupted iterations
default   [  27% ] 374/500 VUs  13.5s/50.0s

running (0m39.0s), 460/500 VUs, 1689 complete and 0 interrupted iterations
default   [  29% ] 460/500 VUs  14.5s/50.0s

running (0m40.0s), 500/500 VUs, 2265 complete and 0 interrupted iterations
default   [  31% ] 500/500 VUs  15.5s/50.0s

running (0m41.0s), 500/500 VUs, 2874 complete and 0 interrupted iterations
default   [  33% ] 500/500 VUs  16.5s/50.0s

running (0m42.0s), 500/500 VUs, 3501 complete and 0 interrupted iterations
default   [  35% ] 500/500 VUs  17.5s/50.0s

running (0m43.0s), 500/500 VUs, 4115 complete and 0 interrupted iterations
default   [  37% ] 500/500 VUs  18.5s/50.0s

running (0m44.0s), 500/500 VUs, 4723 complete and 0 interrupted iterations
default   [  39% ] 500/500 VUs  19.5s/50.0s

running (0m45.0s), 500/500 VUs, 5344 complete and 0 interrupted iterations
default   [  41% ] 500/500 VUs  20.5s/50.0s

running (0m46.0s), 500/500 VUs, 5975 complete and 0 interrupted iterations
default   [  43% ] 500/500 VUs  21.5s/50.0s

running (0m47.0s), 500/500 VUs, 6583 complete and 0 interrupted iterations
default   [  45% ] 500/500 VUs  22.5s/50.0s

running (0m48.0s), 500/500 VUs, 7195 complete and 0 interrupted iterations
default   [  47% ] 500/500 VUs  23.5s/50.0s

running (0m49.0s), 500/500 VUs, 7809 complete and 0 interrupted iterations
default   [  49% ] 500/500 VUs  24.5s/50.0s

running (0m50.0s), 500/500 VUs, 8434 complete and 0 interrupted iterations
default   [  51% ] 500/500 VUs  25.5s/50.0s

running (0m51.0s), 500/500 VUs, 9045 complete and 0 interrupted iterations
default   [  53% ] 500/500 VUs  26.5s/50.0s

running (0m52.0s), 500/500 VUs, 9647 complete and 0 interrupted iterations
default   [  55% ] 500/500 VUs  27.5s/50.0s

running (0m53.0s), 500/500 VUs, 10268 complete and 0 interrupted iterations
default   [  57% ] 500/500 VUs  28.5s/50.0s

running (0m54.0s), 500/500 VUs, 10891 complete and 0 interrupted iterations
default   [  59% ] 500/500 VUs  29.5s/50.0s

running (0m55.0s), 500/500 VUs, 11484 complete and 0 interrupted iterations
default   [  61% ] 500/500 VUs  30.5s/50.0s

running (0m56.0s), 500/500 VUs, 12126 complete and 0 interrupted iterations
default   [  63% ] 500/500 VUs  31.5s/50.0s

running (0m57.0s), 500/500 VUs, 12743 complete and 0 interrupted iterations
default   [  65% ] 500/500 VUs  32.5s/50.0s

running (0m58.0s), 500/500 VUs, 13310 complete and 0 interrupted iterations
default   [  67% ] 500/500 VUs  33.5s/50.0s

running (0m59.0s), 500/500 VUs, 13962 complete and 0 interrupted iterations
default   [  69% ] 500/500 VUs  34.5s/50.0s

running (1m00.0s), 484/500 VUs, 14570 complete and 0 interrupted iterations
default   [  71% ] 484/500 VUs  35.5s/50.0s

running (1m01.0s), 400/500 VUs, 15161 complete and 0 interrupted iterations
default   [  73% ] 400/500 VUs  36.5s/50.0s

running (1m02.0s), 316/500 VUs, 15646 complete and 0 interrupted iterations
default   [  75% ] 316/500 VUs  37.5s/50.0s

running (1m03.0s), 235/500 VUs, 16000 complete and 0 interrupted iterations
default   [  77% ] 235/500 VUs  38.5s/50.0s

running (1m04.0s), 146/500 VUs, 16296 complete and 0 interrupted iterations
default   [  79% ] 146/500 VUs  39.5s/50.0s

running (1m05.0s), 070/500 VUs, 16467 complete and 0 interrupted iterations
default   [  81% ] 070/500 VUs  40.5s/50.0s

running (1m06.0s), 062/500 VUs, 16555 complete and 0 interrupted iterations
default   [  83% ] 062/500 VUs  41.5s/50.0s

running (1m07.0s), 056/500 VUs, 16621 complete and 0 interrupted iterations
default   [  85% ] 056/500 VUs  42.5s/50.0s

running (1m08.0s), 049/500 VUs, 16692 complete and 0 interrupted iterations
default   [  87% ] 049/500 VUs  43.5s/50.0s

running (1m09.0s), 041/500 VUs, 16753 complete and 0 interrupted iterations
default   [  89% ] 041/500 VUs  44.5s/50.0s

running (1m10.0s), 035/500 VUs, 16797 complete and 0 interrupted iterations
default   [  91% ] 035/500 VUs  45.5s/50.0s

running (1m11.0s), 027/500 VUs, 16843 complete and 0 interrupted iterations
default   [  93% ] 027/500 VUs  46.5s/50.0s

running (1m12.0s), 021/500 VUs, 16870 complete and 0 interrupted iterations
default   [  95% ] 021/500 VUs  47.5s/50.0s

running (1m13.0s), 015/500 VUs, 16896 complete and 0 interrupted iterations
default   [  97% ] 015/500 VUs  48.5s/50.0s

running (1m14.0s), 006/500 VUs, 16914 complete and 0 interrupted iterations
default   [  99% ] 006/500 VUs  49.5s/50.0s

running (1m15.0s), 001/500 VUs, 16920 complete and 0 interrupted iterations
default ↓ [ 100% ] 004/500 VUs  50s


  █ THRESHOLDS 

    http_req_duration
    ✓ 'p(95)<2000' p(95)=16.45ms

    http_req_failed
    ✓ 'rate<0.05' rate=0.00%


  █ TOTAL RESULTS 

    checks_total.......: 34842   464.373241/s
    checks_succeeded...: 100.00% 34842 out of 34842
    checks_failed......: 0.00%   0 out of 34842

    ✓ register 201
    ✓ login 200
    ✓ GET /me 200
    ✓ GET /{username} 200

    HTTP
    http_req_duration..............: avg=6.7ms    min=1.86ms   med=5.4ms    max=604.94ms p(90)=10.09ms  p(95)=16.45ms 
      { expected_response:true }...: avg=6.7ms    min=1.86ms   med=5.4ms    max=604.94ms p(90)=10.09ms  p(95)=16.45ms 
    http_req_failed................: 0.00% 0 out of 34842
    http_reqs......................: 34842 464.373241/s

    EXECUTION
    iteration_duration.............: avg=812.83ms min=804.83ms med=811.28ms max=1.4s     p(90)=818.48ms p(95)=823.43ms
    iterations.....................: 16921 225.522634/s
    vus............................: 1     min=0          max=500
    vus_max........................: 500   min=500        max=500

    NETWORK
    data_received..................: 21 MB 282 kB/s
    data_sent......................: 13 MB 170 kB/s




running (1m15.0s), 000/500 VUs, 16921 complete and 0 interrupted iterations
default ✓ [ 100% ] 000/500 VUs  50s

================================================================
% cd DomainUser/user && k6 run user-stress.js
================================================================


         /\      Grafana   /‾‾/  
    /\  /  \     |\  __   /  /   
   /  \/    \    | |/ /  /   ‾‾\ 
  /          \   |   (  |  (‾)  |
 / __________ \  |_|\_\  \_____/ 


     execution: local
        script: user-stress.js
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

running (0m38.0s), 001/600 VUs, 0 complete and 0 interrupted iterations
default   [   0% ] 001/600 VUs  0m00.0s/4m00.0s

running (0m39.0s), 001/600 VUs, 6 complete and 0 interrupted iterations
default   [   0% ] 001/600 VUs  0m01.0s/4m00.0s

running (0m40.0s), 002/600 VUs, 13 complete and 0 interrupted iterations
default   [   1% ] 002/600 VUs  0m02.0s/4m00.0s

running (0m41.0s), 002/600 VUs, 25 complete and 0 interrupted iterations
default   [   1% ] 002/600 VUs  0m03.0s/4m00.0s

running (0m42.0s), 003/600 VUs, 39 complete and 0 interrupted iterations
default   [   2% ] 003/600 VUs  0m04.0s/4m00.0s

running (0m43.0s), 004/600 VUs, 58 complete and 0 interrupted iterations
default   [   2% ] 004/600 VUs  0m05.0s/4m00.0s

running (0m44.0s), 004/600 VUs, 81 complete and 0 interrupted iterations
default   [   3% ] 004/600 VUs  0m06.0s/4m00.0s

running (0m45.0s), 005/600 VUs, 105 complete and 0 interrupted iterations
default   [   3% ] 005/600 VUs  0m07.0s/4m00.0s

running (0m46.0s), 006/600 VUs, 134 complete and 0 interrupted iterations
default   [   3% ] 006/600 VUs  0m08.0s/4m00.0s

running (0m47.0s), 006/600 VUs, 168 complete and 0 interrupted iterations
default   [   4% ] 006/600 VUs  0m09.0s/4m00.0s

running (0m48.0s), 007/600 VUs, 203 complete and 0 interrupted iterations
default   [   4% ] 007/600 VUs  0m10.0s/4m00.0s

running (0m49.0s), 007/600 VUs, 244 complete and 0 interrupted iterations
default   [   5% ] 007/600 VUs  0m11.0s/4m00.0s

running (0m50.0s), 008/600 VUs, 289 complete and 0 interrupted iterations
default   [   5% ] 008/600 VUs  0m12.0s/4m00.0s

running (0m51.0s), 009/600 VUs, 335 complete and 0 interrupted iterations
default   [   5% ] 009/600 VUs  0m13.0s/4m00.0s

running (0m52.0s), 009/600 VUs, 388 complete and 0 interrupted iterations
default   [   6% ] 009/600 VUs  0m14.0s/4m00.0s

running (0m53.0s), 010/600 VUs, 438 complete and 0 interrupted iterations
default   [   6% ] 010/600 VUs  0m15.0s/4m00.0s

running (0m54.0s), 011/600 VUs, 493 complete and 0 interrupted iterations
default   [   7% ] 011/600 VUs  0m16.0s/4m00.0s

running (0m55.0s), 011/600 VUs, 554 complete and 0 interrupted iterations
default   [   7% ] 011/600 VUs  0m17.0s/4m00.0s

running (0m56.0s), 012/600 VUs, 623 complete and 0 interrupted iterations
default   [   8% ] 012/600 VUs  0m18.0s/4m00.0s

running (0m57.0s), 013/600 VUs, 684 complete and 0 interrupted iterations
default   [   8% ] 013/600 VUs  0m19.0s/4m00.0s

running (0m58.0s), 013/600 VUs, 762 complete and 0 interrupted iterations
default   [   8% ] 013/600 VUs  0m20.0s/4m00.0s

running (0m59.0s), 014/600 VUs, 829 complete and 0 interrupted iterations
default   [   9% ] 014/600 VUs  0m21.0s/4m00.0s

running (1m00.0s), 014/600 VUs, 905 complete and 0 interrupted iterations
default   [   9% ] 014/600 VUs  0m22.0s/4m00.0s

running (1m01.0s), 015/600 VUs, 994 complete and 0 interrupted iterations
default   [  10% ] 015/600 VUs  0m23.0s/4m00.0s

running (1m02.0s), 016/600 VUs, 1071 complete and 0 interrupted iterations
default   [  10% ] 016/600 VUs  0m24.0s/4m00.0s

running (1m03.0s), 016/600 VUs, 1151 complete and 0 interrupted iterations
default   [  10% ] 016/600 VUs  0m25.0s/4m00.0s

running (1m04.0s), 017/600 VUs, 1251 complete and 0 interrupted iterations
default   [  11% ] 017/600 VUs  0m26.0s/4m00.0s

running (1m05.0s), 018/600 VUs, 1336 complete and 0 interrupted iterations
default   [  11% ] 018/600 VUs  0m27.0s/4m00.0s

running (1m06.0s), 018/600 VUs, 1427 complete and 0 interrupted iterations
default   [  12% ] 018/600 VUs  0m28.0s/4m00.0s

running (1m07.0s), 019/600 VUs, 1520 complete and 0 interrupted iterations
default   [  12% ] 019/600 VUs  0m29.0s/4m00.0s

running (1m08.0s), 020/600 VUs, 1634 complete and 0 interrupted iterations
default   [  13% ] 020/600 VUs  0m30.0s/4m00.0s

running (1m09.0s), 021/600 VUs, 1734 complete and 0 interrupted iterations
default   [  13% ] 021/600 VUs  0m31.0s/4m00.0s

running (1m10.0s), 022/600 VUs, 1840 complete and 0 interrupted iterations
default   [  13% ] 022/600 VUs  0m32.0s/4m00.0s

running (1m11.0s), 023/600 VUs, 1950 complete and 0 interrupted iterations
default   [  14% ] 023/600 VUs  0m33.0s/4m00.0s

running (1m12.0s), 024/600 VUs, 2087 complete and 0 interrupted iterations
default   [  14% ] 024/600 VUs  0m34.0s/4m00.0s

running (1m13.0s), 025/600 VUs, 2208 complete and 0 interrupted iterations
default   [  15% ] 025/600 VUs  0m35.0s/4m00.0s

running (1m14.0s), 026/600 VUs, 2333 complete and 0 interrupted iterations
default   [  15% ] 026/600 VUs  0m36.0s/4m00.0s

running (1m15.0s), 027/600 VUs, 2463 complete and 0 interrupted iterations
default   [  15% ] 027/600 VUs  0m37.0s/4m00.0s

running (1m16.0s), 028/600 VUs, 2623 complete and 0 interrupted iterations
default   [  16% ] 028/600 VUs  0m38.0s/4m00.0s

running (1m17.0s), 029/600 VUs, 2765 complete and 0 interrupted iterations
default   [  16% ] 029/600 VUs  0m39.0s/4m00.0s

running (1m18.0s), 030/600 VUs, 2939 complete and 0 interrupted iterations
default   [  17% ] 030/600 VUs  0m40.0s/4m00.0s

running (1m19.0s), 031/600 VUs, 3119 complete and 0 interrupted iterations
default   [  17% ] 031/600 VUs  0m41.0s/4m00.0s

running (1m20.0s), 032/600 VUs, 3274 complete and 0 interrupted iterations
default   [  18% ] 032/600 VUs  0m42.0s/4m00.0s

running (1m21.0s), 033/600 VUs, 3432 complete and 0 interrupted iterations
default   [  18% ] 033/600 VUs  0m43.0s/4m00.0s

running (1m22.0s), 034/600 VUs, 3629 complete and 0 interrupted iterations
default   [  18% ] 034/600 VUs  0m44.0s/4m00.0s

running (1m23.0s), 035/600 VUs, 3800 complete and 0 interrupted iterations
default   [  19% ] 035/600 VUs  0m45.0s/4m00.0s

running (1m24.0s), 036/600 VUs, 3975 complete and 0 interrupted iterations
default   [  19% ] 036/600 VUs  0m46.0s/4m00.0s

running (1m25.0s), 037/600 VUs, 4191 complete and 0 interrupted iterations
default   [  20% ] 037/600 VUs  0m47.0s/4m00.0s

running (1m26.0s), 038/600 VUs, 4413 complete and 0 interrupted iterations
default   [  20% ] 038/600 VUs  0m48.0s/4m00.0s

running (1m27.0s), 039/600 VUs, 4641 complete and 0 interrupted iterations
default   [  20% ] 039/600 VUs  0m49.0s/4m00.0s

running (1m28.0s), 040/600 VUs, 4837 complete and 0 interrupted iterations
default   [  21% ] 040/600 VUs  0m50.0s/4m00.0s

running (1m29.0s), 041/600 VUs, 5077 complete and 0 interrupted iterations
default   [  21% ] 041/600 VUs  0m51.0s/4m00.0s

running (1m30.0s), 042/600 VUs, 5322 complete and 0 interrupted iterations
default   [  22% ] 042/600 VUs  0m52.0s/4m00.0s

running (1m31.0s), 043/600 VUs, 5574 complete and 0 interrupted iterations
default   [  22% ] 043/600 VUs  0m53.0s/4m00.0s

running (1m32.0s), 044/600 VUs, 5790 complete and 0 interrupted iterations
default   [  23% ] 044/600 VUs  0m54.0s/4m00.0s

running (1m33.0s), 045/600 VUs, 6054 complete and 0 interrupted iterations
default   [  23% ] 045/600 VUs  0m55.0s/4m00.0s

running (1m34.0s), 046/600 VUs, 6324 complete and 0 interrupted iterations
default   [  23% ] 046/600 VUs  0m56.0s/4m00.0s

running (1m35.0s), 047/600 VUs, 6554 complete and 0 interrupted iterations
default   [  24% ] 047/600 VUs  0m57.0s/4m00.0s

running (1m36.0s), 048/600 VUs, 6833 complete and 0 interrupted iterations
default   [  24% ] 048/600 VUs  0m58.0s/4m00.0s

running (1m37.0s), 049/600 VUs, 7121 complete and 0 interrupted iterations
default   [  25% ] 049/600 VUs  0m59.0s/4m00.0s

running (1m38.0s), 050/600 VUs, 7415 complete and 0 interrupted iterations
default   [  25% ] 050/600 VUs  1m00.0s/4m00.0s

running (1m39.0s), 051/600 VUs, 7717 complete and 0 interrupted iterations
default   [  25% ] 051/600 VUs  1m01.0s/4m00.0s

running (1m40.0s), 053/600 VUs, 8029 complete and 0 interrupted iterations
default   [  26% ] 053/600 VUs  1m02.0s/4m00.0s

running (1m41.0s), 055/600 VUs, 8350 complete and 0 interrupted iterations
default   [  26% ] 055/600 VUs  1m03.0s/4m00.0s

running (1m42.0s), 056/600 VUs, 8681 complete and 0 interrupted iterations
default   [  27% ] 056/600 VUs  1m04.0s/4m00.0s

running (1m43.0s), 058/600 VUs, 9001 complete and 0 interrupted iterations
default   [  27% ] 058/600 VUs  1m05.0s/4m00.0s

running (1m44.0s), 060/600 VUs, 9322 complete and 0 interrupted iterations
default   [  28% ] 060/600 VUs  1m06.0s/4m00.0s

running (1m45.0s), 061/600 VUs, 9686 complete and 0 interrupted iterations
default   [  28% ] 061/600 VUs  1m07.0s/4m00.0s

running (1m46.0s), 063/600 VUs, 10058 complete and 0 interrupted iterations
default   [  28% ] 063/600 VUs  1m08.0s/4m00.0s

running (1m47.0s), 065/600 VUs, 10439 complete and 0 interrupted iterations
default   [  29% ] 065/600 VUs  1m09.0s/4m00.0s

running (1m48.0s), 066/600 VUs, 10844 complete and 0 interrupted iterations
default   [  29% ] 066/600 VUs  1m10.0s/4m00.0s

running (1m49.0s), 068/600 VUs, 11261 complete and 0 interrupted iterations
default   [  30% ] 068/600 VUs  1m11.0s/4m00.0s

running (1m50.0s), 070/600 VUs, 11643 complete and 0 interrupted iterations
default   [  30% ] 070/600 VUs  1m12.0s/4m00.0s

running (1m51.0s), 071/600 VUs, 12076 complete and 0 interrupted iterations
default   [  30% ] 071/600 VUs  1m13.0s/4m00.0s

running (1m52.0s), 073/600 VUs, 12520 complete and 0 interrupted iterations
default   [  31% ] 073/600 VUs  1m14.0s/4m00.0s

running (1m53.0s), 075/600 VUs, 12955 complete and 0 interrupted iterations
default   [  31% ] 075/600 VUs  1m15.0s/4m00.0s

running (1m54.0s), 076/600 VUs, 13439 complete and 0 interrupted iterations
default   [  32% ] 076/600 VUs  1m16.0s/4m00.0s

running (1m55.0s), 078/600 VUs, 13901 complete and 0 interrupted iterations
default   [  32% ] 078/600 VUs  1m17.0s/4m00.0s

running (1m56.0s), 080/600 VUs, 14343 complete and 0 interrupted iterations
default   [  33% ] 080/600 VUs  1m18.0s/4m00.0s

running (1m57.0s), 081/600 VUs, 14850 complete and 0 interrupted iterations
default   [  33% ] 081/600 VUs  1m19.0s/4m00.0s

running (1m58.0s), 083/600 VUs, 15366 complete and 0 interrupted iterations
default   [  33% ] 083/600 VUs  1m20.0s/4m00.0s

running (1m59.0s), 085/600 VUs, 15878 complete and 0 interrupted iterations
default   [  34% ] 085/600 VUs  1m21.0s/4m00.0s

running (2m00.0s), 086/600 VUs, 16394 complete and 0 interrupted iterations
default   [  34% ] 086/600 VUs  1m22.0s/4m00.0s

running (2m01.0s), 088/600 VUs, 16921 complete and 0 interrupted iterations
default   [  35% ] 088/600 VUs  1m23.0s/4m00.0s

running (2m02.0s), 090/600 VUs, 17452 complete and 0 interrupted iterations
default   [  35% ] 090/600 VUs  1m24.0s/4m00.0s

running (2m03.0s), 091/600 VUs, 18005 complete and 0 interrupted iterations
default   [  35% ] 091/600 VUs  1m25.0s/4m00.0s

running (2m04.0s), 093/600 VUs, 18570 complete and 0 interrupted iterations
default   [  36% ] 093/600 VUs  1m26.0s/4m00.0s

running (2m05.0s), 095/600 VUs, 19144 complete and 0 interrupted iterations
default   [  36% ] 095/600 VUs  1m27.0s/4m00.0s

running (2m06.0s), 096/600 VUs, 19730 complete and 0 interrupted iterations
default   [  37% ] 096/600 VUs  1m28.0s/4m00.0s

running (2m07.0s), 098/600 VUs, 20325 complete and 0 interrupted iterations
default   [  37% ] 098/600 VUs  1m29.0s/4m00.0s

running (2m08.0s), 100/600 VUs, 20944 complete and 0 interrupted iterations
default   [  38% ] 100/600 VUs  1m30.0s/4m00.0s

running (2m09.0s), 103/600 VUs, 21578 complete and 0 interrupted iterations
default   [  38% ] 103/600 VUs  1m31.0s/4m00.0s

running (2m10.0s), 106/600 VUs, 22206 complete and 0 interrupted iterations
default   [  38% ] 106/600 VUs  1m32.0s/4m00.0s

running (2m11.0s), 110/600 VUs, 22867 complete and 0 interrupted iterations
default   [  39% ] 110/600 VUs  1m33.0s/4m00.0s

running (2m12.0s), 113/600 VUs, 23561 complete and 0 interrupted iterations
default   [  39% ] 113/600 VUs  1m34.0s/4m00.0s

running (2m13.0s), 116/600 VUs, 24262 complete and 0 interrupted iterations
default   [  40% ] 116/600 VUs  1m35.0s/4m00.0s

running (2m14.0s), 120/600 VUs, 25002 complete and 0 interrupted iterations
default   [  40% ] 120/600 VUs  1m36.0s/4m00.0s

running (2m15.0s), 123/600 VUs, 25762 complete and 0 interrupted iterations
default   [  40% ] 123/600 VUs  1m37.0s/4m00.0s

running (2m16.0s), 126/600 VUs, 26528 complete and 0 interrupted iterations
default   [  41% ] 126/600 VUs  1m38.0s/4m00.0s

running (2m17.0s), 130/600 VUs, 27301 complete and 0 interrupted iterations
default   [  41% ] 130/600 VUs  1m39.0s/4m00.0s

running (2m18.0s), 133/600 VUs, 28114 complete and 0 interrupted iterations
default   [  42% ] 133/600 VUs  1m40.0s/4m00.0s

running (2m19.0s), 136/600 VUs, 28936 complete and 0 interrupted iterations
default   [  42% ] 136/600 VUs  1m41.0s/4m00.0s

running (2m20.0s), 140/600 VUs, 29783 complete and 0 interrupted iterations
default   [  43% ] 140/600 VUs  1m42.0s/4m00.0s

running (2m21.0s), 143/600 VUs, 30645 complete and 0 interrupted iterations
default   [  43% ] 143/600 VUs  1m43.0s/4m00.0s

running (2m22.0s), 146/600 VUs, 31552 complete and 0 interrupted iterations
default   [  43% ] 146/600 VUs  1m44.0s/4m00.0s

running (2m23.0s), 150/600 VUs, 32462 complete and 0 interrupted iterations
default   [  44% ] 150/600 VUs  1m45.0s/4m00.0s

running (2m24.0s), 153/600 VUs, 33385 complete and 0 interrupted iterations
default   [  44% ] 153/600 VUs  1m46.0s/4m00.0s

running (2m25.0s), 156/600 VUs, 34327 complete and 0 interrupted iterations
default   [  45% ] 156/600 VUs  1m47.0s/4m00.0s

running (2m26.0s), 160/600 VUs, 35264 complete and 0 interrupted iterations
default   [  45% ] 160/600 VUs  1m48.0s/4m00.0s

running (2m27.0s), 163/600 VUs, 36160 complete and 0 interrupted iterations
default   [  45% ] 163/600 VUs  1m49.0s/4m00.0s

running (2m28.0s), 166/600 VUs, 37154 complete and 0 interrupted iterations
default   [  46% ] 166/600 VUs  1m50.0s/4m00.0s

running (2m29.0s), 170/600 VUs, 38167 complete and 0 interrupted iterations
default   [  46% ] 170/600 VUs  1m51.0s/4m00.0s

running (2m30.0s), 173/600 VUs, 39203 complete and 0 interrupted iterations
default   [  47% ] 173/600 VUs  1m52.0s/4m00.0s

running (2m31.0s), 176/600 VUs, 40264 complete and 0 interrupted iterations
default   [  47% ] 176/600 VUs  1m53.0s/4m00.0s

running (2m32.0s), 180/600 VUs, 41338 complete and 0 interrupted iterations
default   [  48% ] 180/600 VUs  1m54.0s/4m00.0s

running (2m33.0s), 183/600 VUs, 42437 complete and 0 interrupted iterations
default   [  48% ] 183/600 VUs  1m55.0s/4m00.0s

running (2m34.0s), 186/600 VUs, 43552 complete and 0 interrupted iterations
default   [  48% ] 186/600 VUs  1m56.0s/4m00.0s

running (2m35.0s), 190/600 VUs, 44688 complete and 0 interrupted iterations
default   [  49% ] 190/600 VUs  1m57.0s/4m00.0s

running (2m36.0s), 193/600 VUs, 45755 complete and 0 interrupted iterations
default   [  49% ] 193/600 VUs  1m58.0s/4m00.0s

running (2m37.0s), 196/600 VUs, 46936 complete and 0 interrupted iterations
default   [  50% ] 196/600 VUs  1m59.0s/4m00.0s

running (2m38.0s), 200/600 VUs, 48129 complete and 0 interrupted iterations
default   [  50% ] 200/600 VUs  2m00.0s/4m00.0s

running (2m39.0s), 203/600 VUs, 49300 complete and 0 interrupted iterations
default   [  50% ] 203/600 VUs  2m01.0s/4m00.0s

running (2m40.0s), 206/600 VUs, 50467 complete and 0 interrupted iterations
default   [  51% ] 206/600 VUs  2m02.0s/4m00.0s

running (2m41.0s), 210/600 VUs, 51713 complete and 0 interrupted iterations
default   [  51% ] 210/600 VUs  2m03.0s/4m00.0s

running (2m42.0s), 213/600 VUs, 52936 complete and 0 interrupted iterations
default   [  52% ] 213/600 VUs  2m04.0s/4m00.0s

running (2m43.0s), 216/600 VUs, 54196 complete and 0 interrupted iterations
default   [  52% ] 216/600 VUs  2m05.0s/4m00.0s

running (2m44.0s), 220/600 VUs, 55477 complete and 0 interrupted iterations
default   [  53% ] 220/600 VUs  2m06.0s/4m00.0s

running (2m45.0s), 223/600 VUs, 56698 complete and 0 interrupted iterations
default   [  53% ] 223/600 VUs  2m07.0s/4m00.0s

running (2m46.0s), 226/600 VUs, 57915 complete and 0 interrupted iterations
default   [  53% ] 226/600 VUs  2m08.0s/4m00.0s

running (2m47.0s), 230/600 VUs, 59168 complete and 0 interrupted iterations
default   [  54% ] 230/600 VUs  2m09.0s/4m00.0s

running (2m48.0s), 233/600 VUs, 60435 complete and 0 interrupted iterations
default   [  54% ] 233/600 VUs  2m10.0s/4m00.0s

running (2m49.0s), 236/600 VUs, 61821 complete and 0 interrupted iterations
default   [  55% ] 236/600 VUs  2m11.0s/4m00.0s

running (2m50.0s), 240/600 VUs, 63162 complete and 0 interrupted iterations
default   [  55% ] 240/600 VUs  2m12.0s/4m00.0s

running (2m51.0s), 243/600 VUs, 64542 complete and 0 interrupted iterations
default   [  55% ] 243/600 VUs  2m13.0s/4m00.0s

running (2m52.0s), 246/600 VUs, 65960 complete and 0 interrupted iterations
default   [  56% ] 246/600 VUs  2m14.0s/4m00.0s

running (2m53.0s), 250/600 VUs, 67317 complete and 0 interrupted iterations
default   [  56% ] 250/600 VUs  2m15.0s/4m00.0s

running (2m54.0s), 253/600 VUs, 68735 complete and 0 interrupted iterations
default   [  57% ] 253/600 VUs  2m16.0s/4m00.0s

running (2m55.0s), 256/600 VUs, 70084 complete and 0 interrupted iterations
default   [  57% ] 256/600 VUs  2m17.0s/4m00.0s

running (2m56.0s), 260/600 VUs, 71445 complete and 0 interrupted iterations
default   [  58% ] 260/600 VUs  2m18.0s/4m00.0s

running (2m57.0s), 263/600 VUs, 72860 complete and 0 interrupted iterations
default   [  58% ] 263/600 VUs  2m19.0s/4m00.0s

running (2m58.0s), 266/600 VUs, 74260 complete and 0 interrupted iterations
default   [  58% ] 266/600 VUs  2m20.0s/4m00.0s

running (2m59.0s), 270/600 VUs, 75706 complete and 0 interrupted iterations
default   [  59% ] 270/600 VUs  2m21.0s/4m00.0s

running (3m00.0s), 273/600 VUs, 77156 complete and 0 interrupted iterations
default   [  59% ] 273/600 VUs  2m22.0s/4m00.0s

running (3m01.0s), 276/600 VUs, 78453 complete and 0 interrupted iterations
default   [  60% ] 276/600 VUs  2m23.0s/4m00.0s

running (3m02.0s), 280/600 VUs, 79995 complete and 0 interrupted iterations
default   [  60% ] 280/600 VUs  2m24.0s/4m00.0s

running (3m03.0s), 283/600 VUs, 81517 complete and 0 interrupted iterations
default   [  60% ] 283/600 VUs  2m25.0s/4m00.0s

running (3m04.0s), 286/600 VUs, 83055 complete and 0 interrupted iterations
default   [  61% ] 286/600 VUs  2m26.0s/4m00.0s

running (3m05.0s), 290/600 VUs, 84461 complete and 0 interrupted iterations
default   [  61% ] 290/600 VUs  2m27.0s/4m00.0s

running (3m06.0s), 293/600 VUs, 85987 complete and 0 interrupted iterations
default   [  62% ] 293/600 VUs  2m28.0s/4m00.0s

running (3m07.0s), 296/600 VUs, 87560 complete and 0 interrupted iterations
default   [  62% ] 296/600 VUs  2m29.0s/4m00.0s

running (3m08.0s), 300/600 VUs, 89021 complete and 0 interrupted iterations
default   [  63% ] 300/600 VUs  2m30.0s/4m00.0s

running (3m09.0s), 303/600 VUs, 90543 complete and 0 interrupted iterations
default   [  63% ] 303/600 VUs  2m31.0s/4m00.0s

running (3m10.0s), 306/600 VUs, 92069 complete and 0 interrupted iterations
default   [  63% ] 306/600 VUs  2m32.0s/4m00.0s

running (3m11.0s), 310/600 VUs, 93631 complete and 0 interrupted iterations
default   [  64% ] 310/600 VUs  2m33.0s/4m00.0s

running (3m12.0s), 313/600 VUs, 95115 complete and 0 interrupted iterations
default   [  64% ] 313/600 VUs  2m34.0s/4m00.0s

running (3m13.0s), 316/600 VUs, 96611 complete and 0 interrupted iterations
default   [  65% ] 316/600 VUs  2m35.0s/4m00.0s

running (3m14.0s), 320/600 VUs, 98147 complete and 0 interrupted iterations
default   [  65% ] 320/600 VUs  2m36.0s/4m00.0s

running (3m15.0s), 323/600 VUs, 99748 complete and 0 interrupted iterations
default   [  65% ] 323/600 VUs  2m37.0s/4m00.0s

running (3m16.0s), 326/600 VUs, 101229 complete and 0 interrupted iterations
default   [  66% ] 326/600 VUs  2m38.0s/4m00.0s

running (3m17.0s), 330/600 VUs, 102770 complete and 0 interrupted iterations
default   [  66% ] 330/600 VUs  2m39.0s/4m00.0s

running (3m18.0s), 333/600 VUs, 104266 complete and 0 interrupted iterations
default   [  67% ] 333/600 VUs  2m40.0s/4m00.0s

running (3m19.0s), 336/600 VUs, 105775 complete and 0 interrupted iterations
default   [  67% ] 336/600 VUs  2m41.0s/4m00.0s

running (3m20.0s), 340/600 VUs, 107267 complete and 0 interrupted iterations
default   [  68% ] 340/600 VUs  2m42.0s/4m00.0s

running (3m21.0s), 343/600 VUs, 108703 complete and 0 interrupted iterations
default   [  68% ] 343/600 VUs  2m43.0s/4m00.0s

running (3m22.0s), 346/600 VUs, 110287 complete and 0 interrupted iterations
default   [  68% ] 346/600 VUs  2m44.0s/4m00.0s

running (3m23.0s), 350/600 VUs, 111842 complete and 0 interrupted iterations
default   [  69% ] 350/600 VUs  2m45.0s/4m00.0s

running (3m24.0s), 353/600 VUs, 113385 complete and 0 interrupted iterations
default   [  69% ] 353/600 VUs  2m46.0s/4m00.0s

running (3m25.0s), 356/600 VUs, 114919 complete and 0 interrupted iterations
default   [  70% ] 356/600 VUs  2m47.0s/4m00.0s

running (3m26.0s), 360/600 VUs, 116329 complete and 0 interrupted iterations
default   [  70% ] 360/600 VUs  2m48.0s/4m00.0s

running (3m27.0s), 363/600 VUs, 117864 complete and 0 interrupted iterations
default   [  70% ] 363/600 VUs  2m49.0s/4m00.0s

running (3m28.0s), 366/600 VUs, 119342 complete and 0 interrupted iterations
default   [  71% ] 366/600 VUs  2m50.0s/4m00.0s

running (3m29.0s), 370/600 VUs, 120817 complete and 0 interrupted iterations
default   [  71% ] 370/600 VUs  2m51.0s/4m00.0s

running (3m30.0s), 373/600 VUs, 122277 complete and 0 interrupted iterations
default   [  72% ] 373/600 VUs  2m52.0s/4m00.0s

running (3m31.0s), 376/600 VUs, 123710 complete and 0 interrupted iterations
default   [  72% ] 376/600 VUs  2m53.0s/4m00.0s

running (3m32.0s), 380/600 VUs, 125187 complete and 0 interrupted iterations
default   [  73% ] 380/600 VUs  2m54.0s/4m00.0s

running (3m33.0s), 383/600 VUs, 126723 complete and 0 interrupted iterations
default   [  73% ] 383/600 VUs  2m55.0s/4m00.0s

running (3m34.0s), 386/600 VUs, 128187 complete and 0 interrupted iterations
default   [  73% ] 386/600 VUs  2m56.0s/4m00.0s

running (3m35.0s), 390/600 VUs, 129699 complete and 0 interrupted iterations
default   [  74% ] 390/600 VUs  2m57.0s/4m00.0s

running (3m36.0s), 393/600 VUs, 131139 complete and 0 interrupted iterations
default   [  74% ] 393/600 VUs  2m58.0s/4m00.0s

running (3m37.0s), 396/600 VUs, 132570 complete and 0 interrupted iterations
default   [  75% ] 396/600 VUs  2m59.0s/4m00.0s

running (3m38.0s), 400/600 VUs, 134025 complete and 0 interrupted iterations
default   [  75% ] 400/600 VUs  3m00.0s/4m00.0s

running (3m39.0s), 406/600 VUs, 135500 complete and 0 interrupted iterations
default   [  75% ] 406/600 VUs  3m01.0s/4m00.0s

running (3m40.0s), 413/600 VUs, 136645 complete and 0 interrupted iterations
default   [  76% ] 413/600 VUs  3m02.0s/4m00.0s

running (3m41.0s), 420/600 VUs, 138008 complete and 0 interrupted iterations
default   [  76% ] 420/600 VUs  3m03.0s/4m00.0s

running (3m42.0s), 426/600 VUs, 139503 complete and 0 interrupted iterations
default   [  77% ] 426/600 VUs  3m04.0s/4m00.0s

running (3m43.0s), 433/600 VUs, 141027 complete and 0 interrupted iterations
default   [  77% ] 433/600 VUs  3m05.0s/4m00.0s

running (3m44.0s), 440/600 VUs, 142467 complete and 0 interrupted iterations
default   [  78% ] 440/600 VUs  3m06.0s/4m00.0s

running (3m45.0s), 446/600 VUs, 143830 complete and 0 interrupted iterations
default   [  78% ] 446/600 VUs  3m07.0s/4m00.0s

running (3m46.0s), 453/600 VUs, 145191 complete and 0 interrupted iterations
default   [  78% ] 453/600 VUs  3m08.0s/4m00.0s

running (3m47.0s), 460/600 VUs, 146675 complete and 0 interrupted iterations
default   [  79% ] 460/600 VUs  3m09.0s/4m00.0s

running (3m48.0s), 466/600 VUs, 148127 complete and 0 interrupted iterations
default   [  79% ] 466/600 VUs  3m10.0s/4m00.0s

running (3m49.0s), 473/600 VUs, 149571 complete and 0 interrupted iterations
default   [  80% ] 473/600 VUs  3m11.0s/4m00.0s

running (3m50.0s), 480/600 VUs, 151087 complete and 0 interrupted iterations
default   [  80% ] 480/600 VUs  3m12.0s/4m00.0s

running (3m51.0s), 486/600 VUs, 152563 complete and 0 interrupted iterations
default   [  80% ] 486/600 VUs  3m13.0s/4m00.0s

running (3m52.0s), 493/600 VUs, 154042 complete and 0 interrupted iterations
default   [  81% ] 493/600 VUs  3m14.0s/4m00.0s

running (3m53.0s), 500/600 VUs, 155417 complete and 0 interrupted iterations
default   [  81% ] 500/600 VUs  3m15.0s/4m00.0s

running (3m54.0s), 506/600 VUs, 156916 complete and 0 interrupted iterations
default   [  82% ] 506/600 VUs  3m16.0s/4m00.0s

running (3m55.0s), 513/600 VUs, 158308 complete and 0 interrupted iterations
default   [  82% ] 513/600 VUs  3m17.0s/4m00.0s

running (3m56.0s), 520/600 VUs, 159715 complete and 0 interrupted iterations
default   [  83% ] 520/600 VUs  3m18.0s/4m00.0s

running (3m57.0s), 526/600 VUs, 161190 complete and 0 interrupted iterations
default   [  83% ] 526/600 VUs  3m19.0s/4m00.0s

running (3m58.0s), 533/600 VUs, 162546 complete and 0 interrupted iterations
default   [  83% ] 533/600 VUs  3m20.0s/4m00.0s

running (3m59.0s), 540/600 VUs, 164120 complete and 0 interrupted iterations
default   [  84% ] 540/600 VUs  3m21.0s/4m00.0s

running (4m00.0s), 546/600 VUs, 165462 complete and 0 interrupted iterations
default   [  84% ] 546/600 VUs  3m22.0s/4m00.0s

running (4m01.0s), 553/600 VUs, 166878 complete and 0 interrupted iterations
default   [  85% ] 553/600 VUs  3m23.0s/4m00.0s

running (4m02.0s), 560/600 VUs, 168319 complete and 0 interrupted iterations
default   [  85% ] 560/600 VUs  3m24.0s/4m00.0s

running (4m03.0s), 566/600 VUs, 169747 complete and 0 interrupted iterations
default   [  85% ] 566/600 VUs  3m25.0s/4m00.0s

running (4m04.0s), 573/600 VUs, 171146 complete and 0 interrupted iterations
default   [  86% ] 573/600 VUs  3m26.0s/4m00.0s

running (4m05.0s), 580/600 VUs, 172560 complete and 0 interrupted iterations
default   [  86% ] 580/600 VUs  3m27.0s/4m00.0s

running (4m06.0s), 586/600 VUs, 173979 complete and 0 interrupted iterations
default   [  87% ] 586/600 VUs  3m28.0s/4m00.0s

running (4m07.0s), 593/600 VUs, 175435 complete and 0 interrupted iterations
default   [  87% ] 593/600 VUs  3m29.0s/4m00.0s

running (4m08.0s), 600/600 VUs, 176922 complete and 0 interrupted iterations
default   [  88% ] 600/600 VUs  3m30.0s/4m00.0s

running (4m09.0s), 582/600 VUs, 178470 complete and 0 interrupted iterations
default   [  88% ] 582/600 VUs  3m31.0s/4m00.0s

running (4m10.0s), 566/600 VUs, 179913 complete and 0 interrupted iterations
default   [  88% ] 566/600 VUs  3m32.0s/4m00.0s

running (4m11.0s), 541/600 VUs, 181401 complete and 0 interrupted iterations
default   [  89% ] 541/600 VUs  3m33.0s/4m00.0s

running (4m12.0s), 524/600 VUs, 182940 complete and 0 interrupted iterations
default   [  89% ] 524/600 VUs  3m34.0s/4m00.0s

running (4m13.0s), 503/600 VUs, 184533 complete and 0 interrupted iterations
default   [  90% ] 503/600 VUs  3m35.0s/4m00.0s

running (4m14.0s), 482/600 VUs, 186107 complete and 0 interrupted iterations
default   [  90% ] 482/600 VUs  3m36.0s/4m00.0s

running (4m15.0s), 461/600 VUs, 187716 complete and 0 interrupted iterations
default   [  90% ] 461/600 VUs  3m37.0s/4m00.0s

running (4m16.0s), 443/600 VUs, 189151 complete and 0 interrupted iterations
default   [  91% ] 443/600 VUs  3m38.0s/4m00.0s

running (4m17.0s), 422/600 VUs, 190671 complete and 0 interrupted iterations
default   [  91% ] 422/600 VUs  3m39.0s/4m00.0s

running (4m18.0s), 401/600 VUs, 192122 complete and 0 interrupted iterations
default   [  92% ] 401/600 VUs  3m40.0s/4m00.0s

running (4m19.0s), 383/600 VUs, 193610 complete and 0 interrupted iterations
default   [  92% ] 383/600 VUs  3m41.0s/4m00.0s

running (4m20.0s), 362/600 VUs, 195156 complete and 0 interrupted iterations
default   [  93% ] 362/600 VUs  3m42.0s/4m00.0s

running (4m21.0s), 342/600 VUs, 196698 complete and 0 interrupted iterations
default   [  93% ] 342/600 VUs  3m43.0s/4m00.0s

running (4m22.0s), 322/600 VUs, 198268 complete and 0 interrupted iterations
default   [  93% ] 322/600 VUs  3m44.0s/4m00.0s

running (4m23.0s), 301/600 VUs, 199854 complete and 0 interrupted iterations
default   [  94% ] 301/600 VUs  3m45.0s/4m00.0s

running (4m24.0s), 282/600 VUs, 201356 complete and 0 interrupted iterations
default   [  94% ] 282/600 VUs  3m46.0s/4m00.0s

running (4m25.0s), 260/600 VUs, 202879 complete and 0 interrupted iterations
default   [  95% ] 260/600 VUs  3m47.0s/4m00.0s

running (4m26.0s), 243/600 VUs, 204178 complete and 0 interrupted iterations
default   [  95% ] 243/600 VUs  3m48.0s/4m00.0s

running (4m27.0s), 222/600 VUs, 205550 complete and 0 interrupted iterations
default   [  95% ] 222/600 VUs  3m49.0s/4m00.0s

running (4m28.0s), 201/600 VUs, 206818 complete and 0 interrupted iterations
default   [  96% ] 201/600 VUs  3m50.0s/4m00.0s

running (4m29.0s), 183/600 VUs, 208005 complete and 0 interrupted iterations
default   [  96% ] 183/600 VUs  3m51.0s/4m00.0s

running (4m30.0s), 162/600 VUs, 209064 complete and 0 interrupted iterations
default   [  97% ] 162/600 VUs  3m52.0s/4m00.0s

running (4m31.0s), 141/600 VUs, 210014 complete and 0 interrupted iterations
default   [  97% ] 141/600 VUs  3m53.0s/4m00.0s

running (4m32.0s), 121/600 VUs, 210827 complete and 0 interrupted iterations
default   [  98% ] 121/600 VUs  3m54.0s/4m00.0s

running (4m33.0s), 102/600 VUs, 211551 complete and 0 interrupted iterations
default   [  98% ] 102/600 VUs  3m55.0s/4m00.0s

running (4m34.0s), 081/600 VUs, 212108 complete and 0 interrupted iterations
default   [  98% ] 081/600 VUs  3m56.0s/4m00.0s

running (4m35.0s), 062/600 VUs, 212528 complete and 0 interrupted iterations
default   [  99% ] 062/600 VUs  3m57.0s/4m00.0s

running (4m36.0s), 042/600 VUs, 212847 complete and 0 interrupted iterations
default   [  99% ] 042/600 VUs  3m58.0s/4m00.0s

running (4m37.0s), 022/600 VUs, 213046 complete and 0 interrupted iterations
default   [ 100% ] 022/600 VUs  3m59.0s/4m00.0s

running (4m38.0s), 001/600 VUs, 213114 complete and 0 interrupted iterations
default ↓ [ 100% ] 001/600 VUs  4m0s


  █ THRESHOLDS 

    http_req_duration
    ✓ 'p(95)<5000' p(95)=147ms

    http_req_failed
    ✓ 'rate<0.1' rate=0.00%


  █ TOTAL RESULTS 

    checks_total.......: 427830  1538.353247/s
    checks_succeeded...: 100.00% 427830 out of 427830
    checks_failed......: 0.00%   0 out of 427830

    ✓ register 201
    ✓ login 200
    ✓ GET /me 200
    ✓ GET /{username} 200

    HTTP
    http_req_duration..............: avg=42.26ms  min=1.99ms  med=21.88ms  max=714.52ms p(90)=107.66ms p(95)=147ms   
      { expected_response:true }...: avg=42.26ms  min=1.99ms  med=21.88ms  max=714.52ms p(90)=107.66ms p(95)=147ms   
    http_req_failed................: 0.00%  0 out of 427830
    http_reqs......................: 427830 1538.353247/s

    EXECUTION
    iteration_duration.............: avg=235.05ms min=154.6ms med=200.99ms max=906.97ms p(90)=361.9ms  p(95)=406.28ms
    iterations.....................: 213115 766.300054/s
    vus............................: 1      min=0           max=600
    vus_max........................: 600    min=600         max=600

    NETWORK
    data_received..................: 257 MB 925 kB/s
    data_sent......................: 159 MB 573 kB/s




running (4m38.1s), 000/600 VUs, 213115 complete and 0 interrupted iterations
default ✓ [ 100% ] 000/600 VUs  4m0s
