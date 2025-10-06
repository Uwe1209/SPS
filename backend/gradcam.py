import os
import sys
import json
import torch
import cv2
import numpy as np
from torchvision import models, transforms

# ======= Config =======
CHECKPOINT_PATH = "resnet18_with_class_label_weights_best_acc.tar"
OUTPUT_DIR = "heatmaps"
os.makedirs(OUTPUT_DIR, exist_ok=True)

MODEL_CONFIG = {
    "resnet18": {"size": 224, "norm_mean": [0.485,0.456,0.406], "norm_std": [0.229,0.224,0.225], "conv_layer": "layer4"},
}

def preprocess_image(img_path):
    config = MODEL_CONFIG["resnet18"]
    img = cv2.imread(img_path, cv2.IMREAD_COLOR)
    img = cv2.resize(img, (config["size"], config["size"]))
    img = transforms.ToTensor()(img)
    img = transforms.Normalize(mean=config["norm_mean"], std=config["norm_std"])(img)
    return img.unsqueeze(0)

def get_conv_layer(model, layer_name):
    for name, layer in model.named_modules():
        if name == layer_name:
            return layer
    raise ValueError(f"Layer '{layer_name}' not found")

def compute_gradcam(model, img_tensor, class_index, conv_layer_name="layer4"):
    conv_layer = get_conv_layer(model, conv_layer_name)
    activations = None
    grads = None

    def forward_hook(module, input, output):
        nonlocal activations
        activations = output

    def backward_hook(module, grad_in, grad_out):
        nonlocal grads
        grads = grad_out[0]

    f_hook = conv_layer.register_forward_hook(forward_hook)
    b_hook = conv_layer.register_full_backward_hook(backward_hook)

    img_tensor.requires_grad_(True)
    preds = model(img_tensor)
    loss = preds[:, class_index]
    model.zero_grad()
    loss.backward()

    pooled_grads = torch.mean(grads, dim=[0,2,3]).detach().cpu().numpy()
    activations = activations.detach().cpu().numpy()[0]

    for i in range(pooled_grads.shape[0]):
        activations[i,...] *= pooled_grads[i]

    heatmap = np.mean(activations, axis=0)
    heatmap = np.maximum(heatmap,0)
    heatmap /= np.max(heatmap)+1e-8

    f_hook.remove()
    b_hook.remove()
    return heatmap

def overlay_heatmap(img_path, heatmap, alpha=0.4):
    img = cv2.imread(img_path)
    heatmap = cv2.resize(heatmap, (img.shape[1], img.shape[0]))
    heatmap = np.uint8(255*heatmap)
    heatmap = cv2.applyColorMap(heatmap, cv2.COLORMAP_JET)
    superimposed = cv2.addWeighted(img, alpha, heatmap, 1-alpha, 0)
    return superimposed

# ======= Main =======
if __name__ == "__main__":
    image_path = sys.argv[1]   # first arg: image path
    output_filename = os.path.join(OUTPUT_DIR, os.path.basename(image_path))

    checkpoint = torch.load(CHECKPOINT_PATH, map_location="cpu")
    num_classes = len(checkpoint["class_to_idx"])
    model = models.resnet18(weights=None)
    model.fc = torch.nn.Linear(model.fc.in_features, num_classes)
    model.load_state_dict(checkpoint["model"])
    model.eval()

    img_tensor = preprocess_image(image_path)
    with torch.no_grad():
        preds = model(img_tensor)
    class_index = torch.argmax(preds, dim=1).item()

    heatmap = compute_gradcam(model, img_tensor, class_index, conv_layer_name="layer4")
    output_img = overlay_heatmap(image_path, heatmap)
    filename = os.path.splitext(os.path.basename(image_path))[0]  # get base name without extension
    output_filename = os.path.join(OUTPUT_DIR, f"{filename}_heatmap.jpg")
    cv2.imwrite(output_filename, output_img)


    print(json.dumps({"heatmap_path": output_filename}))  # Return JSON path
