# Matplotlib Tutorial: Learn by Coding

Learn Matplotlib through hands-on coding examples. Each concept is immediately followed by code you can run and modify.

## 1. Matplotlib Architecture: Figure and Axes

**Key Concepts:** Figure (container), Axes (plot area), Axis (number lines)

```python
import matplotlib.pyplot as plt
import numpy as np

# Create data
x = np.linspace(0, 10, 100)
y = np.sin(x)

# Object-oriented approach (recommended for control)
fig, ax = plt.subplots(figsize=(8, 5))  # fig = container, ax = plot area
ax.plot(x, y)  # Plot data on the axes
ax.set_xlabel('X values')  # Label for x-axis
ax.set_ylabel('sin(X)')    # Label for y-axis
ax.set_title('Sine Wave')  # Title of the plot
plt.show()  # Display the plot

# What you see: A window with a sine wave plot, labeled axes, and title
```

## 2. Basic Line Plots

**Concept:** Show trends over time or relationships between variables

```python
# Simple line plot
x = np.linspace(0, 10, 100)
y = np.sin(x)

plt.figure(figsize=(8, 5))
plt.plot(x, y, 'b-', linewidth=2)  # 'b-' = blue solid line
plt.xlabel('Time (s)')
plt.ylabel('Amplitude')
plt.title('Simple Sine Wave')
plt.grid(True, alpha=0.3)  # Light grid for readability
plt.show()

# What you see: A smooth blue oscillating wave
```

```python
# Multiple lines with legend
x = np.linspace(0, 10, 100)
y1 = np.sin(x)
y2 = np.cos(x)

plt.figure(figsize=(10, 6))
plt.plot(x, y1, 'r-', label='sin(x)', linewidth=2)    # Red solid
plt.plot(x, y2, 'g--', label='cos(x)', linewidth=2)   # Green dashed
plt.xlabel('X values')
plt.ylabel('Y values')
plt.title('Sine and Cosine Functions')
plt.legend()  # Shows which line is which
plt.grid(True, alpha=0.3)
plt.show()

# What you see: Two waves - red sine (starts at 0), green cosine (starts at 1)
```

## 3. Customizing Plots: Colors, Styles, Markers

**Concept:** Make plots informative and visually distinct

```python
# Line styles and markers
x = np.linspace(0, 10, 20)

plt.figure(figsize=(12, 6))
plt.plot(x, x, 'b-', label='Solid', linewidth=2)         # Solid line
plt.plot(x, x+1, 'r--', label='Dashed', linewidth=2)     # Dashed line
plt.plot(x, x+2, 'g-.', label='Dash-dot', linewidth=2)   # Dash-dot
plt.plot(x, x+3, 'm:', label='Dotted', linewidth=2)      # Dotted
plt.plot(x, x+4, 'co-', label='Circles', markersize=8)   # Circles
plt.plot(x, x+5, 's-', label='Squares', markersize=6)    # Squares
plt.plot(x, x+6, '^-', label='Triangles', markersize=6)  # Triangles

plt.xlabel('X Axis')
plt.ylabel('Y Axis')
plt.title('Line Styles and Markers')
plt.legend()
plt.grid(True, alpha=0.3)
plt.show()

# What you see: Six different line styles from solid to dotted, plus marker variations
```

```python
# Custom colors (names, hex, RGB tuples)
x = np.linspace(0, 10, 100)

plt.figure(figsize=(10, 6))
plt.plot(x, np.sin(x), color='darkblue', linewidth=2.5)
plt.plot(x, np.cos(x), color='#FF6B6B', linewidth=2.5)  # Hex color
plt.plot(x, -np.sin(x), color=(0.8, 0.2, 0.6), linewidth=2.5)  # RGB tuple

plt.xlabel('X values')
plt.ylabel('Y values')
plt.title('Custom Color Specification')
plt.legend(['darkblue', '#FF6B6B', 'RGB(0.8,0.2,0.6)'])
plt.grid(True, alpha=0.3)
plt.show()

# What you see: Three waves in different shades of blue/red/pink
```

## 4. Scatter Plots

**Concept:** Visualize relationships between two variables

```python
# Basic scatter plot
np.random.seed(42)
x = np.random.randn(100)
y = 2 * x + np.random.randn(100) * 0.5

plt.figure(figsize=(8, 6))
plt.scatter(x, y, alpha=0.6, s=30)  # alpha=transparency, s=marker size
plt.xlabel('X values')
plt.ylabel('Y values')
plt.title('Scatter Plot: Linear Relationship with Noise')
plt.grid(True, alpha=0.3)
plt.show()

# What you see: Points roughly forming a diagonal line with scatter
```

```python
# Scatter with color and size encoding
np.random.seed(42)
x = np.random.randn(100)
y = np.random.randn(100)
colors = np.random.rand(100)         # Color values
sizes = 1000 * np.random.rand(100)   # Size values

plt.figure(figsize=(10, 6))
scatter = plt.scatter(x, y, c=colors, s=sizes, alpha=0.6, cmap='viridis')
plt.colorbar(scatter, label='Color Intensity')  # Shows color mapping
plt.xlabel('X values')
plt.ylabel('Y values')
plt.title('Scatter Plot: Color and Size Variations')
plt.grid(True, alpha=0.3)
plt.show()

# What you see: Points of varying size and color (purple-yellow gradient)
```

## 5. Bar Charts

**Concept:** Compare categorical data or show counts

```python
# Vertical bar chart
categories = ['A', 'B', 'C', 'D', 'E']
values = [23, 45, 56, 78, 32]

plt.figure(figsize=(8, 6))
bars = plt.bar(categories, values, color='steelblue', edgecolor='black', linewidth=1.2)
plt.xlabel('Categories')
plt.ylabel('Values')
plt.title('Simple Bar Chart')
plt.grid(True, alpha=0.3, axis='y')  # Horizontal grid only
plt.show()

# What you see: Five vertical bars of increasing then decreasing height
```

```python
# Horizontal bar chart
plt.figure(figsize=(8, 6))
plt.barh(categories, values, color='coral', edgecolor='black', linewidth=1.2)
plt.xlabel('Values')
plt.ylabel('Categories')
plt.title('Horizontal Bar Chart')
plt.grid(True, alpha=0.3, axis='x')  # Vertical grid only
plt.show()

# What you see: Same data as horizontal bars
```

```python
# Grouped bar chart
categories = ['Q1', 'Q2', 'Q3', 'Q4']
product_a = [20, 35, 30, 35]
product_b = [25, 32, 34, 20]
product_c = [30, 25, 30, 25]

x = np.arange(len(categories))  # [0, 1, 2, 3]
width = 0.25  # Width of each bar

plt.figure(figsize=(10, 6))
plt.bar(x - width, product_a, width, label='Product A', color='#FF6B6B')
plt.bar(x, product_b, width, label='Product B', color='#4ECDC4')
plt.bar(x + width, product_c, width, label='Product C', color='#95E1D3')

plt.xlabel('Quarter')
plt.ylabel('Sales')
plt.title('Quarterly Sales Comparison')
plt.xticks(x, categories)
plt.legend()
plt.grid(True, alpha=0.3, axis='y')
plt.show()

# What you see: Three sets of four bars each, grouped by quarter
```

## 6. Histograms

**Concept:** Show distribution of numerical data

```python
# Basic histogram
np.random.seed(42)
data = np.random.normal(100, 15, 1000)  # Mean=100, Std=15

plt.figure(figsize=(10, 6))
n, bins, patches = plt.hist(data, bins=30, color='skyblue', edgecolor='black', alpha=0.7)
plt.xlabel('Value')
plt.ylabel('Frequency')
plt.title('Histogram: Normal Distribution')
plt.grid(True, alpha=0.3, axis='y')
plt.show()

# What you see: Bell-shaped curve centered around 100
```

```python
# Overlapping histograms
np.random.seed(42)
data1 = np.random.normal(100, 15, 1000)
data2 = np.random.normal(120, 20, 1000)

plt.figure(figsize=(10, 6))
plt.hist(data1, bins=30, alpha=0.6, label='Dataset 1', color='blue')
plt.hist(data2, bins=30, alpha=0.6, label='Dataset 2', color='red')
plt.xlabel('Value')
plt.ylabel('Frequency')
plt.title('Overlapping Histograms: Two Distributions')
plt.legend()
plt.grid(True, alpha=0.3, axis='y')
plt.show()

# What you see: Two overlapping bell curves, one centered at 100, one at 120
```

## 7. Subplots: Multiple Plots in One Figure

**Concept:** Compare different visualizations side-by-side

```python
# 2x2 subplot grid
x = np.linspace(0, 10, 100)

fig, axes = plt.subplots(2, 2, figsize=(12, 10))
fig.suptitle('Multiple Subplot Types', fontsize=16, fontweight='bold')

# Top left: Line plot
axes[0, 0].plot(x, np.sin(x), 'b-', linewidth=2)
axes[0, 0].set_title('Sine Wave')
axes[0, 0].grid(True, alpha=0.3)

# Top right: Cosine
axes[0, 1].plot(x, np.cos(x), 'r-', linewidth=2)
axes[0, 1].set_title('Cosine Wave')
axes[0, 1].grid(True, alpha=0.3)

# Bottom left: Scatter
np.random.seed(42)
x_scatter = np.random.randn(100)
y_scatter = np.random.randn(100)
axes[1, 0].scatter(x_scatter, y_scatter, alpha=0.6, c=x_scatter, cmap='plasma')
axes[1, 0].set_title('Scatter Plot')
axes[1, 0].grid(True, alpha=0.3)

# Bottom right: Bar chart
categories = ['A', 'B', 'C', 'D']
values = [23, 45, 56, 78]
axes[1, 1].bar(categories, values, color='orange')
axes[1, 1].set_title('Bar Chart')
axes[1, 1].grid(True, alpha=0.3, axis='y')

plt.tight_layout()  # Optimizes spacing
plt.show()

# What you see: Four different plots arranged in a 2x2 grid
```

## 8. Working with Pandas DataFrames

**Concept:** Seamless integration with data analysis workflows

```python
# Create sample DataFrame
np.random.seed(42)
dates = pd.date_range('2023-01-01', periods=100, freq='D')
df = pd.DataFrame({
    'Date': dates,
    'Sales': np.random.randint(1000, 5000, 100) + np.sin(np.arange(100)) * 200,
    'Profit': np.random.randint(200, 800, 100) + np.cos(np.arange(100)) * 100,
    'Region': np.random.choice(['North', 'South', 'East', 'West'], 100)
})

# Plot directly from DataFrame
plt.figure(figsize=(12, 6))
plt.plot(df['Date'], df['Sales'], label='Sales', linewidth=2, color='#2E86AB')
plt.plot(df['Date'], df['Profit'], label='Profit', linewidth=2, color='#F67280')
plt.xlabel('Date')
plt.ylabel('Amount ($)')
plt.title('Sales and Profit Over Time')
plt.legend()
plt.grid(True, alpha=0.3)
plt.xticks(rotation=45)
plt.tight_layout()
plt.show()

# What you see: Two time series showing sales and profit trends over time
```

```python
# Using pandas plotting methods
fig, axes = plt.subplots(2, 1, figsize=(12, 10))

# Line plot using pandas
df.plot(x='Date', y='Sales', ax=axes[0], color='#2E86AB', linewidth=2)
axes[0].set_title('Sales Over Time (Pandas Plot)')
axes[0].set_ylabel('Sales ($)')
axes[0].grid(True, alpha=0.3)
axes[0].tick_params(axis='x', rotation=45)

# Bar chart by region
region_sales = df.groupby('Region')['Sales'].mean()
region_sales.plot(kind='bar', ax=axes[1], color='#F67280', edgecolor='black')
axes[1].set_title('Average Sales by Region')
axes[1].set_ylabel('Average Sales ($)')
axes[1].set_xlabel('Region')
axes[1].grid(True, alpha=0.3, axis='y')

plt.tight_layout()
plt.show()

# What you see: Top - sales trend over time; Bottom - bar chart comparing regions
```

## 9. Advanced Customization: Annotations, Text, Legends

**Concept:** Make plots more informative and professional

```python
# Annotations and text elements
x = np.linspace(0, 10, 100)
y = np.sin(x)

fig, ax = plt.subplots(figsize=(10, 6))
ax.plot(x, y, 'b-', linewidth=2, label='sin(x)')

# Annotation with arrow
max_idx = np.argmax(y)
ax.annotate('Maximum Point', 
            xy=(x[max_idx], y[max_idx]),        # Point to annotate
            xytext=(x[max_idx] + 1.5, y[max_idx] + 0.3),  # Text position
            arrowprops=dict(arrowstyle='->', color='red', lw=1.5),
            fontsize=11, color='red', fontweight='bold')

# Text box
ax.text(0.02, 0.98, 'Sine wave oscillation\nAmplitude: -1 to 1', 
        transform=ax.transAxes, fontsize=10,
        verticalalignment='top',
        bbox=dict(boxstyle='round,pad=0.3', facecolor='yellow', alpha=0.3))

# Reference lines
ax.axvline(x=np.pi, color='green', linestyle='--', alpha=0.7, label='x=π')
ax.axhline(y=0, color='gray', linestyle='-', alpha=0.4)

ax.set_xlabel('X values (radians)', fontsize=12)
ax.set_ylabel('sin(X)', fontsize=12)
ax.set_title('Annotated Sine Wave with Key Points', fontsize=14, fontweight='bold')
ax.legend(fontsize=10)
ax.grid(True, alpha=0.3)
plt.show()

# What you see: Sine wave with max point marked, text box, and reference lines
```

```python
# Customized legends
x = np.linspace(0, 10, 100)

fig, ax = plt.subplots(figsize=(10, 6))
ax.plot(x, np.sin(x), label='sin(x)', linewidth=2.5)
ax.plot(x, np.cos(x), label='cos(x)', linewidth=2.5)
ax.plot(x, np.sin(x)*np.cos(x), label='sin(x)×cos(x)', linewidth=2.5)

# Professional legend styling
legend = ax.legend(loc='upper right', frameon=True, fancybox=True, 
                   shadow=True, fontsize=11, title='Trigonometric Functions',
                   title_fontsize=12)
legend.get_title().set_fontweight('bold')

ax.set_xlabel('X values (radians)', fontsize=12)
ax.set_ylabel('Y values', fontsize=12)
ax.set_title('Function Comparison with Styled Legend', fontsize=14, fontweight='bold')
ax.grid(True, alpha=0.3)
plt.show()

# What you see: Three curves with a professional-looking legend in the corner
```

## 10. Plot Styles and Themes

**Concept:** Instantly change plot appearance with built-in styles

```python
# Compare different styles
x = np.linspace(0, 10, 100)
y1 = np.sin(x)
y2 = np.cos(x)

styles = ['default', 'seaborn-v0_8', 'ggplot', 'dark_background']
fig, axes = plt.subplots(2, 2, figsize=(14, 10))

for i, style in enumerate(styles):
    row = i // 2
    col = i % 2
    plt.style.use(style)  # Apply style
    
    axes[row, col].plot(x, y1, label='sin(x)', linewidth=2.5)
    axes[row, col].plot(x, y2, label='cos(x)', linewidth=2.5)
    axes[row, col].set_title(f'Style: {style}', fontsize=12, fontweight='bold')
    axes[row, col].legend(fontsize=10)
    axes[row, col].grid(True, alpha=0.3)

plt.suptitle('Matplotlib Built-in Styles Comparison', fontsize=16, fontweight='bold')
plt.tight_layout()
plt.show()

# Reset to default style
plt.style.use('default')

# What you see: Same data plotted in four different visual styles
```

## 11. Pie Charts

**Concept:** Show proportions and percentages

```python
# Proportional pie chart
categories = ['North', 'South', 'East', 'West']
sizes = [35, 25, 20, 20]  # Must sum to meaningful total
colors = ['#FF9999', '#66B2FF', '#99FF99', '#FFD700']  # Distinct colors
explode = (0.05, 0, 0, 0)  # Slightly offset first slice

fig, ax = plt.subplots(figsize=(8, 8))
wedges, texts, autotexts = ax.pie(sizes, explode=explode, labels=categories, 
                                  colors=colors, autopct='%1.1f%%', 
                                  shadow=True, startangle=90,
                                  textprops=dict(color="black", fontsize=11))

# Enhance text appearance
for autotext in autotexts:
    autotext.set_color('white')
    autotext.set_fontweight('bold')

ax.set_title('Regional Distribution', fontsize=16, fontweight='bold', pad=20)
plt.show()

# What you see: Four colored slices showing regional percentages
```

## 12. Saving Figures

**Concept:** Preserve your work for reports and sharing

```python
# Create a publication-quality plot
x = np.linspace(0, 10, 1000)
y = np.exp(-x/5) * np.sin(x)  # Damped oscillation

fig, ax = plt.subplots(figsize=(10, 6))
ax.plot(x, y, 'b-', linewidth=2.5)
ax.set_xlabel('Time (s)', fontsize=12)
ax.set_ylabel('Displacement', fontsize=12)
ax.set_title('Damped Harmonic Oscillator', fontsize=14, fontweight='bold')
ax.grid(True, alpha=0.3)

# Save in multiple formats
fig.savefig('damped_oscillator.png', dpi=300, bbox_inches='tight')  # Raster
fig.savefig('damped_oscillator.pdf', bbox_inches='tight')          # Vector (scalable)
fig.savefig('damped_oscillator.svg', bbox_inches='tight')          # Vector (web)

print("Saved as: PNG (300 DPI), PDF, and SVG formats")
print("- PNG: Good for presentations, 300 DPI = print quality")
print("- PDF/SVG: Vector formats, scalable without quality loss")
print("- bbox_inches='tight': Removes excess whitespace")
print("- dpi: Controls raster image resolution")

plt.show()

# What you see: A damped sine wave saved in multiple formats
```

## 13. Matplotlib Best Practices Cheat Sheet

**Essential patterns for effective visualizations**

### Plot Selection
- `plt.plot()` - Trends, time series, continuous relationships
- `plt.scatter()` - Relationships, distributions, clusters (use alpha for overlap)
- `plt.bar()` - Categorical comparisons, counts
- `plt.hist()` - Data distributions, frequency analysis
- `plt.boxplot()` - Statistical summaries, outlier detection
- `plt.pie()` - Simple part-to-whole relationships (limit to 5-6 slices)

### Figure Setup
```python
# Consistent sizing for reports
plt.figure(figsize=(10, 6))  # Width, height in inches

# Subplots with shared axes
fig, axes = plt.subplots(2, 2, figsize=(12, 10), sharex=True)
```

### Color & Style Guidelines
```python
# Accessible color combinations
plt.plot(x, y, color='#2E86AB', linewidth=2.5)  # Blue
plt.plot(x, z, color='#F67280', linewidth=2.5)  # Red
# Avoid red/green combinations for colorblind accessibility

# Professional line styles
'-'  # Solid (primary data)
'--' # Dashed (secondary/reference)
'-.' # Dash-dot (tertiary)
':'  # Dotted (uncertainty/predictions)
```

### Labeling & Annotation
```python
# Clear, descriptive labels
plt.xlabel('Measurement Time (seconds)', fontsize=12)
plt.ylabel('Voltage (millivolts)', fontsize=12)
plt.title('Experimental Results: Control Group', fontsize=14, fontweight='bold')

# Informative annotations
plt.annotate('Peak Response', 
             xy=(peak_time, peak_value),
             xytext=(peak_time+1, peak_value+0.5),
             arrowprops=dict(arrowstyle='->', color='red'))
```

### Saving for Different Uses
```python
# Screen presentation
plt.savefig('presentation.png', dpi=150, bbox_inches='tight')

# Print publication
plt.savefig('publication.pdf', bbox_inches='tight')

# Web sharing
plt.savefig('web.svg', bbox_inches='tight')
```

### Quick Reference
- `plt.grid(True, alpha=0.3)` - Subtle grid for readability
- `plt.legend(frameon=True, fancybox=True, shadow=True)` - Professional legend
- `plt.tight_layout()` - Prevents label cutoff
- `plt.close()` - Memory management in loops

**Remember:** The best visualization communicates insights clearly. Always ask: "What should the viewer understand from this plot?"