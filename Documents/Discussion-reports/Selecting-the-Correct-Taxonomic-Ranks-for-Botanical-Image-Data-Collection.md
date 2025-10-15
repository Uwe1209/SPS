### Selecting the Correct Taxonomic Ranks for Botanical Image Data Collection

Date: 4th of October, 2025

---

### 1. Executive Summary

This report outlines a clear and effective methodology for selecting the correct taxonomic ranks when downloading botanical image data in bulk from platforms like iNaturalist. The primary objective of this process is to create a comprehensive, accurate, and well-defined dataset suitable for image classification projects. The core principle is to select the single taxonomic rank that perfectly matches the scope of the target group, thereby including all desired subjects while excluding all unwanted ones. Standard cases involve choosing the Species rank (e.g., *Avicennia marina*), the Genus rank (e.g., *Rhododendron*), or the Family rank (e.g., *Orchidaceae*). The report also addresses advanced cases where this principle must be augmented, such as when searching for non-taxonomic traits (e.g., "epiphytic" species) or when dealing with genera that have undergone significant taxonomic revision (e.g., *Didymocarpus*). Following this guide will ensure the resulting dataset is scientifically robust and fit for purpose.

---

### 2. Methodology for Selecting Taxonomic Ranks

#### 2.1. The Core Principle: Precise and Efficient Scoping

The fundamental rule for data collection is to choose the taxonomic rank that is broad enough to include all target subjects but specific enough to exclude all non-target subjects. A single, well-chosen rank is almost always sufficient and is more efficient than selecting multiple ranks.

#### 2.2. Standard Cases and Applications

The appropriate rank is determined by the scope of the project's target group.

##### 2.2.1. Targeting a Specific Species
To obtain all variations of a single species, select the **Species** rank. This rank is hierarchical and will automatically include all its subordinate subspecies.
*   **Example: *Casuarina equisetifolia***
    *   Choosing the species *Casuarina equisetifolia* will correctly include all its subspecies, such as *C. equisetifolia subsp. equisetifolia* and *C. equisetifolia subsp. incana*. It is unnecessary and redundant to select the subspecies in addition to the species.

##### 2.2.2. Targeting an Entire Genus
To obtain all species within a specific genus, select the **Genus** rank.
*   **Example: *Rhododendron***
    *   Choosing **Genus *Rhododendron*** is the correct method for gathering images of all rhododendrons. This selection correctly includes all species botanically classified as azaleas, as they are a sub-group within the *Rhododendron* genus.
*   **Example: *Begonia***
    *   Choosing **Genus *Begonia*** provides all 2,000+ *Begonia* species while correctly excluding the single non-*Begonia* species found in the broader **Family *Begoniaceae***.

##### 2.2.3. Targeting an Entire Family
To obtain all species within a family, select the **Family** rank. This is only appropriate when the family is "pure," meaning it contains only the desired target subjects.
*   **Example: *Orchidaceae***
    *   The **Family *Orchidaceae*** consists entirely of orchids. Therefore, selecting the family rank is the correct and most efficient way to gather data on all orchid species from all orchid genera.

#### 2.3. Differentiating Between "Pure" and "Mixed" Families

It is crucial to understand the composition of a family before selecting it.
*   **Comparison: *Orchidaceae* vs. *Rafflesiaceae***
    *   **Family *Orchidaceae*** is a "pure" group for an orchid project.
    *   **Family *Rafflesiaceae*** is a "mixed" group for a *Rafflesia* project because it contains not only the target Genus *Rafflesia* but also the non-target genera *Rhizanthes* and *Sapria*. Therefore, the more specific **Genus *Rafflesia*** must be chosen to isolate the correct plants.

---

### 3. Advanced Cases and Exceptions

#### 3.1. Non-Taxonomic Traits (Ecological Filters)
When the target group is defined by a characteristic that is not part of the taxonomic hierarchy (e.g., growth habit), taxonomy must be combined with filtering.
*   **Example: "all epiphytic *Lycopodium* species"**
    *   Simply choosing **Genus *Lycopodium*** is incorrect, as modern taxonomy places most epiphytic clubmosses in other genera like *Phlegmariurus*.
    *   **Correct Method:** 1.) Select the broader **Family *Lycopodiaceae*** to include all relevant genera. 2.) Apply a platform-specific filter or annotation for the growth habit "epiphyte."

#### 3.2. Genera with Recent Taxonomic Revisions
Taxonomy is not static. When targeting a genus that has been recently revised, be aware that selecting the genus will yield its modern, strict definition.
*   **Example: *Didymocarpus***
    *   This was historically a large genus. Many species have since been moved to other genera, primarily *Henckelia*.
    *   **Correct Method:** Choose **Genus *Didymocarpus***. This will provide an accurate dataset of the species currently accepted within the genus. This means the dataset will intentionally exclude species now classified as *Henckelia*.

---

### 4. Conclusion

The process of collecting a clean and comprehensive image dataset for a classification project begins with the precise selection of taxonomic rank. For standard cases, the choice between Species, Genus, or Family is determined by identifying the level that perfectly defines the target group without including unwanted subjects. For more complex cases involving non-taxonomic traits or revised genera, a combined approach of selecting a broader taxonomic rank and applying specific filters is necessary. By adhering to this structured methodology, researchers can confidently build high-quality datasets that are scientifically accurate and optimally suited for their project goals.