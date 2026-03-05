

import { useEffect } from "react"
import { useNavigate, useLocation, useParams } from 'react-router-dom';

export function ScrollToTop() {
  const pathname = useLocation().pathname

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" })
  }, [pathname])

  return null
}
