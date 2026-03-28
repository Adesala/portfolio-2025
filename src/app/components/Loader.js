export const MyLoader = () => {
  const { active, progress } = useProgress()
  return active ? (
   
      <div className={styles.loaderPage}>{progress.toFixed(0)} %</div>
  
  ) : null
}