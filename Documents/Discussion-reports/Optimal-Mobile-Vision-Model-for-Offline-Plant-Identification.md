### Optimal Mobile Vision Model for Offline Plant Identification

Date: 16th of October, 2025

---

### 1. Executive Summary

This report details the analysis and final recommendation for selecting an optimal mobile image classification model for a national park's plant identification application. The primary operational constraints are that the model must run entirely offline, function effectively on any mobile device a tourist might possess, and provide high accuracy for fine-grained plant identification. An exhaustive "scorched earth" analysis was conducted, surveying the entire landscape of mobile vision architectures before focusing on Vision Transformer (ViT) models as requested. A comparative analysis was then performed on the leading contenders: EfficientViT, MobileViGv2, and MobileViTv3. The analysis concludes that the **EfficientViT** model family is the superior choice, as its architecture is uniquely designed to optimize for real-world hardware bottlenecks on common mobile CPUs, directly addressing the critical "run on any device" constraint. The final recommendation is to begin development with the **EfficientViT-M4** variant, as it provides the optimal balance of high accuracy required for this task and the low-latency performance necessary for a positive user experience on a broad spectrum of hardware.

---

### 2. Introduction and Problem Definition

The objective is to select a deep learning model for a mobile application designed to help national park visitors identify plants. The selection is governed by a strict set of operational requirements that prioritize accessibility, reliability, and user experience in a disconnected, real-world environment.

#### 2.1. Core Constraints

The project's success is defined by three critical constraints that the chosen model must satisfy:

**Offline Operation:** The application must function without an internet connection, as connectivity in national parks is often unreliable or non-existent. This mandates that the model be bundled directly within the application. Consequently, model file size and memory footprint are critical considerations to avoid excessive app download size and ensure smooth operation on devices with limited storage and RAM.

**Device Agnosticism ("Run on Any Device"):** The application must be performant across a wide and unpredictable range of tourist-owned mobile devices. This includes older and mid-range phones that may lack specialized AI accelerators (e.g., NPUs, EdgeTPUs). Therefore, model performance (latency) on standard mobile CPUs is the primary benchmark for success, as this represents the most common hardware configuration.

**Task-Specific Accuracy:** Plant identification is a fine-grained image classification task, requiring the model to distinguish between visually similar species, leaf patterns, and flowers. The model must possess sufficient capacity to achieve a high level of accuracy to be a reliable and trustworthy tool for visitors, where a misidentification could be frustrating or even dangerous.

---

### 3. Comprehensive Model Landscape Analysis

A multi-stage analysis was conducted to identify the best possible architecture, starting with a broad survey of all mobile vision models and progressively narrowing the focus to the most suitable candidates.

#### 3.1. Initial Survey of CNNs and Hybrids

An extensive review of all major mobile-optimized Convolutional Neural Network (CNN) families was performed to understand the foundational principles of efficient on-device processing. This included, but was not limited to, the MobileNet lineage (V1-V4), EfficientNet (V1-V2, Lite), ShuffleNet, GhostNet, and SqueezeNet. This work established the performance baselines and core techniques (like depthwise separable convolutions) that inform modern architectures.

#### 3.2. Focused Survey of Mobile Vision Transformers (ViTs)

As per the directive to focus on ViT-only architectures, a detailed analysis of models designed specifically for mobile constraints was conducted. Unlike general-purpose ViTs, these mobile variants are specialized hybrids that incorporate efficiency principles from CNNs to reduce computational cost. The top contenders identified were:
*   **EfficientViT:** A family of models focused on optimizing for real-world hardware bottlenecks like memory access, designed for high throughput.
*   **MobileViGv2:** A state-of-the-art model using novel graph-based attention, achieving very high accuracy with low latency, particularly on NPUs.
*   **MobileViTv3:** The latest iteration from Apple's influential MobileViT family, representing a powerful and well-balanced generalist architecture.

---

### 4. Comparative Analysis and Final Selection

The top ViT contenders were evaluated against the project's core constraints to determine the final selection.

#### 4.1. Model Comparison and Rationale

A direct comparison reveals a clear winner based on the project's specific needs. While all three are excellent models, their design philosophies lead to different strengths.

**MobileViGv2** demonstrates exceptional peak accuracy and is a top performer in benchmarks. However, its performance is heavily showcased on high-end NPUs like Apple's Neural Engine. This makes it a risky choice for this project, as its novel graph-based attention mechanism may not be as optimized for the generic CPUs found in the majority of tourist devices, potentially leading to poor performance on non-flagship phones.

**MobileViTv3** is a powerful and well-balanced generalist. As a successor to the highly influential MobileViT, it is a safe and reliable choice that performs well across a wide range of mobile hardware. It stands as a very strong runner-up, but it does not possess the same explicit focus on CPU-centric bottlenecks as our top choice.

**EfficientViT** stands out as the superior option for this specific task. Its entire design philosophy is built around solving the "any device" problem by minimizing memory-bound operations, which are the primary performance bottlenecks on standard CPUs. This direct focus on practical, real-world hardware efficiency, combined with the fact that its larger variants achieve state-of-the-art accuracy, makes it the most robust and reliable solution.

#### 4.2. Specific Version Recommendation: EfficientViT-M4

Within the winning EfficientViT family, a mid-range model is required to balance accuracy and performance.

The smallest models in the family (e.g., M0-M2), while extremely fast, would likely lack the representational capacity required for a reliable fine-grained classification task like plant identification, risking user trust. Conversely, the largest models (e.g., M5 and above) would introduce unacceptable latency on mid-range CPUs and lead to excessive app size, memory usage, and battery drain, violating the core constraints of offline use and broad device compatibility.

The **EfficientViT-M4** variant represents the ideal "sweet spot." It is powerful enough to provide high accuracy for the challenging task of plant identification while remaining lightweight enough to ensure a responsive user experience and efficient offline deployment on the vast majority of devices.

---

### 5. Conclusion

After a thorough, multi-stage analysis of the mobile vision model landscape, this report concludes that the EfficientViT family is the most suitable architecture for the national park's offline plant identification application. The final recommendation is to proceed with the **EfficientViT-M4** model. This specific variant provides the best-in-class trade-off between the high accuracy needed for reliable plant identification and the low-latency CPU performance required to serve all park visitors, regardless of their mobile device. This choice will deliver a scientifically robust and highly responsive user experience.