import sys
import json
import torch
import torch.nn as nn
import torch.nn.functional as F
from torchvision.models import resnet18
from torchvision import transforms
from PIL import Image

#Setup
num_classes = 12
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

# Load model (ResNet18)
model = resnet18(pretrained=False)
model.fc = nn.Linear(model.fc.in_features, num_classes)

# Load checkpoint
checkpoint = torch.load("resnet18_with_class_label_weights_best_acc.tar", map_location=device)
model.load_state_dict(checkpoint['model'], strict=False)

# Build idx_to_class mapping
idx_to_class = {v: k for k, v in checkpoint["class_to_idx"].items()}

model = model.to(device)
model.eval()

# Preprocessing
transform = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
    transforms.Normalize([0.485, 0.456, 0.406],
                         [0.229, 0.224, 0.225])
])

def predict(image_path, topk=3):
    try:
        img = Image.open(image_path).convert('RGB')
    except Exception as e:
        return {"error": f"Could not open image: {str(e)}"}

    img_tensor = transform(img).unsqueeze(0).to(device)

    with torch.no_grad():
        output = model(img_tensor)
        probs = F.softmax(output, dim=1)[0]

        # Get top-k predictions
        top_probs, top_idxs = probs.topk(topk)
        top_probs = top_probs.cpu().numpy()
        top_idxs = top_idxs.cpu().numpy()

        results = []
        for i in range(topk):
            results.append({
                "class": idx_to_class[top_idxs[i]],
                "confidence": round(float(top_probs[i]), 4)
            })

    return results

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print(json.dumps({"error": "No image path provided"}))
        sys.exit(1)

    image_path = sys.argv[1]
    results = predict(image_path, topk=3)
    print(json.dumps(results, indent=2))
    sys.exit(0)
