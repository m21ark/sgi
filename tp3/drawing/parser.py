from PIL import Image
import math

def color_distance(color1, color2):
    # Calculate Euclidean distance between two colors
    return math.sqrt(sum((c1 - c2) ** 2 for c1, c2 in zip(color1, color2)))

def is_approximate_color(color, target_color, threshold=50):
    # Check if the color is approximately equal to the target color
    return color_distance(color, target_color) <= threshold

def get_color_coordinates(image_path, target_color):
    # Open the image
    img = Image.open(image_path)

    # Get the size of the image
    width, height = img.size

    # Initialize a list to store the coordinates of matching pixels
    matching_coordinates = []

    # Iterate through each pixel in the image
    for x in range(width):
        for y in range(height):
            # Get the pixel value (R, G, B, A)
            pixel_value = img.getpixel((x, y))

            if(pixel_value == (255,255,255,255)):
                continue
            # else:
                # print(pixel_value)

            # Check if the pixel is approximately equal to the target color
            if is_approximate_color(pixel_value, target_color):
                matching_coordinates.append((x, y))

    return matching_coordinates

def sort_coordinates_by_distance(coordinates):
    # Ensure the list is not empty
    if not coordinates:
        return []

    # Initialize the sorted list with the first point
    sorted_coordinates = [coordinates[0]]
    remaining_coordinates = coordinates[1:]

    # Iterate until all points are sorted
    while remaining_coordinates:
        last_point = sorted_coordinates[-1]

        # Find the closest point to the last point
        closest_point = min(remaining_coordinates, key=lambda coord: math.sqrt((coord[0] - last_point[0])**2 + (coord[1] - last_point[1])**2))

        # Add the closest point to the sorted list and remove it from the remaining coordinates
        sorted_coordinates.append(closest_point)
        remaining_coordinates.remove(closest_point)

    return sorted_coordinates

def find(string, target_color):
    coordinates = get_color_coordinates("track.png", target_color)
    sorted_coordinates = sort_coordinates_by_distance(coordinates)

    print(f'"{string}": [')
    for coordinate in sorted_coordinates:
        print('  {')
        print(f'    "x": {coordinate[0]},')
        print(f'    "z": {coordinate[1]}')
        print('  },')
    print(']')


def create_wrapped_track(sorted_coordinates, starting_point):
    # Find the index of the starting point in the sorted coordinates
   
    try:
        start_index = sorted_coordinates.index(starting_point)
    except ValueError:
        print("Starting point not found in the sorted coordinates.")
        return []

    # Create a wrapped track starting from the specified index
    wrapped_track = sorted_coordinates[start_index:] + sorted_coordinates[:start_index]
    wrapped_track.append(sorted_coordinates[start_index])

    return wrapped_track


def printTrack():
    coordinates = get_color_coordinates("track.png", (255, 0, 0, 255))  # RED
    sorted_coordinates = sort_coordinates_by_distance(coordinates)

    starting_point =  (12, 68)
    wrapped_track = create_wrapped_track(sorted_coordinates, starting_point)

    print(f'"track": [')
    for coordinate in wrapped_track:
        print('  {')
        print(f'    "x": {coordinate[0]},')
        print(f'    "z": {coordinate[1]}')
        print('  },')
    print(']')



printTrack()
print("=================================")
find("trees", (0,255,0,255))  # GREEN
print("=================================")
find("powerups", (0,0,255,255)) # BLUE 
print("=================================")
find("lake", (255,0,255,255)) # PURPLE 















