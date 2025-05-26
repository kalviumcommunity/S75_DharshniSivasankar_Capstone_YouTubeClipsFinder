"use client"
import { useVideoContext } from "../context/VideoContext"
import "./CategorySelector.css"

const CategorySelector = () => {
  const { categories, selectedCategory, setSelectedCategory, fetchTrendingVideos } = useVideoContext()

  const handleCategoryChange = (category) => {
    setSelectedCategory(category)
    fetchTrendingVideos(category)
  }

  return (
    <div className="category-selector">
      {categories.map((category) => (
        <button
          key={category}
          className={`category-button ${selectedCategory === category ? "active" : ""}`}
          onClick={() => handleCategoryChange(category)}
        >
          {category.charAt(0).toUpperCase() + category.slice(1)}
        </button>
      ))}
    </div>
  )
}

export default CategorySelector
