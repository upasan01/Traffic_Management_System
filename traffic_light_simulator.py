import time
from enum import Enum

# Define the possible states for a traffic light
class LightState(Enum):
    RED = "🔴 RED"
    GREEN = "🟢 GREEN"
    YELLOW = "🟡 YELLOW"

# --- TrafficLight Class ---
class TrafficLight:
    """Represents a single traffic light with a state and timing."""
    def __init__(self, name, initial_state=LightState.RED):
        self.name = name
        self.state = initial_state

    def set_state(self, new_state):
        """Sets the new state of the light."""
        self.state = new_state
        print(f"🚦 {self.name} Light is now: {self.state.value}")

    def __str__(self):
        """String representation for printing."""
        return f"Light({self.name}, State: {self.state.value})"

# --- Intersection Class (The TMS Core) ---
class Intersection:
    """Manages the logic and timing for an intersection of two roads."""
    def __init__(self, road1_name="North-South", road2_name="East-West"):
        # Create two main traffic lights
        self.light1 = TrafficLight(road1_name, LightState.GREEN) # Start one road with GREEN
        self.light2 = TrafficLight(road2_name, LightState.RED)   # Start the other with RED

        # Define the cycle timings (in seconds)
        self.GREEN_DURATION = 10
        self.YELLOW_DURATION = 3
        self.RED_DURATION = self.GREEN_DURATION + self.YELLOW_DURATION # Must match the other light's cycle

    def display_status(self):
        """Prints the current status of the intersection."""
        print("-" * 30)
        print("🚥 Current Intersection Status:")
        print(f"  {self.light1}")
        print(f"  {self.light2}")
        print("-" * 30)

    def cycle_lights(self):
        """
        Executes one full cycle of the traffic lights.
        Road 1 (Green -> Yellow -> Red) and Road 2 (Red -> Green)
        """
        # Phase 1: Road 1 is GREEN, Road 2 is RED
        print("\n--- PHASE 1: Traffic flowing on Road 1 ---")
        self.light1.set_state(LightState.GREEN)
        self.light2.set_state(LightState.RED)
        self.display_status()
        time.sleep(self.GREEN_DURATION) # Wait for green duration

        # Phase 2: Road 1 changes to YELLOW (warning)
        print("\n--- PHASE 2: Road 1 preparing to stop ---")
        self.light1.set_state(LightState.YELLOW)
        self.light2.set_state(LightState.RED) # Road 2 remains RED
        self.display_status()
        time.sleep(self.YELLOW_DURATION) # Wait for yellow duration

        # Phase 3: Road 1 is RED, Road 2 changes to GREEN
        print("\n--- PHASE 3: Traffic stops on Road 1, starts on Road 2 ---")
        self.light1.set_state(LightState.RED)
        self.light2.set_state(LightState.GREEN)
        self.display_status()
        time.sleep(self.GREEN_DURATION) # Wait for green duration on Road 2

        # Phase 4: Road 2 changes to YELLOW (warning)
        print("\n--- PHASE 4: Road 2 preparing to stop ---")
        self.light1.set_state(LightState.RED) # Road 1 remains RED
        self.light2.set_state(LightState.YELLOW)
        self.display_status()
        time.sleep(self.YELLOW_DURATION) # Wait for yellow duration

        # End of cycle, ready to start Phase 1 again (Road 1 GREEN)

# --- Simulation Execution ---
if __name__ == "__main__":
    print("--- Starting Traffic Management System Simulation ---")

    # Initialize the intersection
    intersection = Intersection()

    # Run for a few cycles
    NUM_CYCLES = 3
    for i in range(1, NUM_CYCLES + 1):
        print(f"\n================ CYCLE {i} ===================")
        intersection.cycle_lights()

    print("\n--- Simulation Complete ---")
