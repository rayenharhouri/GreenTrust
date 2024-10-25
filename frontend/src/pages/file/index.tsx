import { useQuery } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import { useState } from "react";
import lightencyLogo from '../../assets/lightency.png';





function UploadPage() {
    const { uuid } = useParams();
    const [loading, setLoading] = useState(false);

    const  { isPending } = useQuery<[]>({ queryKey: ['file', uuid], async queryFn() {
        return (await (await fetch(`http://localhost:3000/files/${uuid}`)).json())
    } })

    if(isPending) {
      return null;
    }
    return (
      <div style={styles.container}>
          <div style={styles.horizontal}>
              <img src={lightencyLogo} alt="Lightency Logo" style={styles.image} />  <p>Downloading files...</p>
          </div>
      </div>
  );
}

const styles = {
  container: {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100vh',
      fontSize: '42px',
  } as React.CSSProperties,
  horizontal: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
  } as React.CSSProperties,
  image: {
      width: '150px', // Adjust the size if needed
      marginRight: '20px', // Space between image and text
  } as React.CSSProperties,
};




export default UploadPage
