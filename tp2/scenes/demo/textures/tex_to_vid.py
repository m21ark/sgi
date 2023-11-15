import cv2
import numpy as np

# Load your texture image
texture = cv2.imread('grid.jpg')

# Set the video properties (resolution, frame rate, etc.)
width, height = texture.shape[1], texture.shape[0]
fps = 30
fourcc = cv2.VideoWriter_fourcc(*'XVID')
out = cv2.VideoWriter('grid_vid.avi', fourcc, fps, (width, height))

# Create a loop to animate the texture
for x_translation in range(0, width, 3):  # Adjust the step size as needed
    frame = np.roll(texture, x_translation, axis=1)  # Translate the texture horizontally
    out.write(frame)

# Release the video writer and close
out.release()
