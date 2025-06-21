import React from 'react';
import './PaperSharing.css'
const PaperSharing = () => {
    return (
        <div className='sharing'>
            <h2 className='paper-sharing'>Paper Submission : </h2>
            <p>
                Technical papers describing original, previously unpublished research results, experimental or theoretical, are solicited in all areas described above. The template for the conference is available at :
                <a href="https://www.ieee.org/conferences/publishing/templates.html" target='_blank'> here</a></p>
            <p>
                The full text papers should be submitted by one of the authors of the paper through electronic submission. Submissions by anyone other than the authors will not be accepted. The submitting author takes responsibility for the paper during submission and peer review.
            </p>
            <p>
                Authors are invited to submit papers through Microsoft's Conference Management Toolkit (CMT). The authors are invited to submit full papers up to 6 pages through: <a href="https://cmt3.research.microsoft.com/ICTEST2025">"https://cmt3.research.microsoft.com/ICTEST2025"</a></p>
            <p> After logging into the Conference Management System, please click on the “Create new submission” tab and follow the instructions. The Title of the paper and the Abstract are to be entered separately, along with the full paper.
            </p>
            <p>
                Papers must be submitted on the understanding that they have not been published elsewhere and are not currently under consideration by another conference. The submitting author is responsible for ensuring that the article's publication has been approved by all the other co-authors. It is also the authors' responsibility to ensure that the articles emanating from a particular institution are submitted with the approval of the necessary institution. All enquiries concerning the publication of accepted papers should be addressed to the conference secretariat at contact us.
            </p>
            <p>
                All submissions will undergo a rigorous peer-review process led by an International Technical Program Committee. Accepted and presented papers will be submitted to IEEE Xplore Digital Library, ensuring wide visibility and impact for your research work. All submissions are processed through Crossref Similarity Check (iThenticate) to screen for plagiarism.
            </p>
        </div>
    );
};

export default PaperSharing;
