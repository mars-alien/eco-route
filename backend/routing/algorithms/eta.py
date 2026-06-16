class EtaPredictor:
    """
    Linear ETA model:
      ETA (minutes) = b0 + b1 * total_distance_km + b2 * num_stops
    Coefficients:
      b0 = 5.0  — base overhead per route (app setup, first movement)
      b1 = 2.0  — minutes per km (30 km/h average city speed)
      b2 = 3.0  — minutes per stop (unloading + customer confirmation)
    Production path: train on historical delivery logs with features
    time_of_day, day_of_week, vehicle_type using sklearn LinearRegression.
    """

    def __init__(self, b0: float = 5.0, b1: float = 2.0, b2: float = 3.0):
        self.b0 = b0
        self.b1 = b1
        self.b2 = b2

    def predict(self, total_distance_km: float, num_stops: int) -> float:
        return round(self.b0 + self.b1 * total_distance_km + self.b2 * num_stops, 1)

    def predict_cumulative(self, distance_so_far: float, stops_so_far: int) -> float:
        """ETA from depot to a specific stop (cumulative)."""
        return round(self.b0 + self.b1 * distance_so_far + self.b2 * stops_so_far, 1)
