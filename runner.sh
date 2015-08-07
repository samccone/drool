for i in `seq 30 60`;
do
  node taste.js | tee "results/run"$i".csv"
done
